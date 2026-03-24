"use strict";

/**
 * vendor.controller.js — Controller for Odoo-backed vendor listing.
 *
 * This is READ-ONLY. No Odoo writes occur here.
 * Filtering and pagination are applied in-process on the fetched Odoo data
 * so the frontend hook (useVendors) doesn't need to change its call contract.
 */

const Vendor = require("../models/Vendor");
const User = require("../models/User");
const {
  ensureVendorCacheWarm,
  getCacheState,
  syncVendorsFromOdoo,
} = require("../services/vendorSyncService");

const normalizeSlug = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

/**
 * GET /api/odoo/vendors[?filtersOnly=true&search=&country=&size=&badge=&page=1&limit=20]
 *
 * Returns vendor data fetched live from Odoo with server-side filtering/pagination.
 * Response shape matches the existing MongoDB vendor endpoint so useVendors works unchanged.
 */
const toClientVendor = (vendor) => {
  const odooId = Number(vendor?.odooId);
  return {
    ...vendor,
    _id: Number.isFinite(odooId) ? `odoo_${odooId}` : String(vendor?._id),
  };
};

const parseFavoriteIds = (favoriteVendors) => {
  const odooIds = [];
  const mongoIds = [];

  (favoriteVendors || []).forEach((rawId) => {
    const value = String(rawId || "").trim();
    if (!value) return;

    if (value.startsWith("odoo_")) {
      const parsed = Number(value.slice(5));
      if (Number.isFinite(parsed)) {
        odooIds.push(parsed);
      }
      return;
    }

    mongoIds.push(value);
  });

  return { odooIds, mongoIds };
};

exports.getVendorsFromOdoo = async (req, res) => {
  try {
    const {
      search,
      country,
      size,
      badge,
      page = 1,
      limit = 20,
      filtersOnly,
      favoriteOnly,
    } = req.query;

    await ensureVendorCacheWarm();

    const filterPipeline = [
      { $match: { source: "odoo" } },
      {
        $project: {
          country: 1,
          size: 1,
          badgeVOE: 1,
          services: 1,
        },
      },
    ];

    const allForFilters = await Vendor.aggregate(filterPipeline);

    const countries = [
      ...new Set(allForFilters.map((v) => v.country).filter(Boolean)),
    ].sort();
    const sizes = [
      ...new Set(allForFilters.map((v) => v.size).filter(Boolean)),
    ].sort();
    const badges = [
      ...new Set(allForFilters.map((v) => v.badgeVOE).filter(Boolean)),
    ].sort();
    const services = [
      ...new Set(
        allForFilters
          .flatMap((v) => (Array.isArray(v.services) ? v.services : []))
          .filter(Boolean),
      ),
    ].sort();

    const filters = { countries, sizes, badges, services };

    // filtersOnly=true is used by the hook on initial load to populate the sidebar
    if (filtersOnly === "true") {
      return res.json({ filters });
    }

    const mongoFilter = { source: "odoo" };
    const andConditions = [];

    if (String(favoriteOnly).toLowerCase() === "true") {
      const user = await User.findById(req.user._id).select("favoriteVendors");
      const { odooIds, mongoIds } = parseFavoriteIds(
        user?.favoriteVendors || [],
      );

      if (odooIds.length === 0 && mongoIds.length === 0) {
        return res.json({
          vendors: [],
          total: 0,
          page: 1,
          totalPages: 1,
          filters,
        });
      }

      const favoriteConditions = [];
      if (odooIds.length > 0)
        favoriteConditions.push({ odooId: { $in: odooIds } });
      if (mongoIds.length > 0)
        favoriteConditions.push({ _id: { $in: mongoIds } });
      andConditions.push({ $or: favoriteConditions });
    }

    if (search && search.trim()) {
      andConditions.push({
        $or: [
          { name: { $regex: search.trim(), $options: "i" } },
          { country: { $regex: search.trim(), $options: "i" } },
          { shortDescription: { $regex: search.trim(), $options: "i" } },
          {
            services: { $elemMatch: { $regex: search.trim(), $options: "i" } },
          },
        ],
      });
    }

    if (country) {
      mongoFilter.country = {
        $in: country
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
      };
    }

    if (size) {
      mongoFilter.size = {
        $in: size
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };
    }

    if (badge) {
      mongoFilter.badgeVOE = {
        $in: badge
          .split(",")
          .map((b) => b.trim())
          .filter(Boolean),
      };
    }

    if (andConditions.length > 0) {
      mongoFilter.$and = andConditions;
    }

    const total = await Vendor.countDocuments(mongoFilter);
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const vendorsFromDb = await Vendor.find(mongoFilter)
      .sort({ badgeVOE: -1, globalScore: -1, name: 1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const vendors = vendorsFromDb.map(toClientVendor);

    return res.json({
      vendors,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      filters, // always included for convenience
    });
  } catch (error) {
    console.error("[Odoo] getVendorsFromOdoo failed:", error.message);

    return res.status(503).json({
      success: false,
      message: "Vendor service temporarily unavailable",
    });
  }
};

/**
 * GET /api/odoo/vendors/:slug
 *
 * Returns one vendor from Mongo cache by slug (indexed lookup).
 */
exports.getVendorBySlugFromOdoo = async (req, res) => {
  try {
    const slug = normalizeSlug(req.params.slug);
    if (!slug) {
      return res.status(400).json({ message: "Invalid vendor slug" });
    }

    await ensureVendorCacheWarm();

    // Use indexed slug lookup - much faster than scanning all vendors
    const vendor = await Vendor.findOne({
      source: "odoo",
      slug: { $regex: slug, $options: "i" },
    })
      .select(
        "name slug logo country size foundedYear website shortDescription services badgeVOE globalScore odooId",
      )
      .lean();

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    return res.json({ vendor: toClientVendor(vendor) });
  } catch (error) {
    console.error("[Odoo] getVendorBySlugFromOdoo failed:", error.message);
    return res.status(503).json({
      success: false,
      message: "Vendor service temporarily unavailable",
    });
  }
};

exports.syncVendorsCache = async (req, res) => {
  try {
    const result = await syncVendorsFromOdoo({ bypassOdooCache: true });
    const cacheState = await getCacheState();

    return res.json({
      message: "Vendor cache sync completed",
      result,
      cacheState,
    });
  } catch (error) {
    console.error("[VendorSync] Manual sync failed:", error.message);
    return res.status(503).json({
      success: false,
      message: "Vendor sync failed",
      error: error.message,
    });
  }
};
