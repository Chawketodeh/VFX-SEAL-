"use strict";

/**
 * vendor.controller.js — Controller for Odoo-backed vendor listing.
 *
 * This is READ-ONLY. No Odoo writes occur here.
 * Filtering and pagination are applied in-process on the fetched Odoo data
 * so the frontend hook (useVendors) doesn't need to change its call contract.
 */

const { getVendors } = require("../services/odooService");

/**
 * GET /api/odoo/vendors[?filtersOnly=true&search=&country=&size=&badge=&page=1&limit=20]
 *
 * Returns vendor data fetched live from Odoo with server-side filtering/pagination.
 * Response shape matches the existing MongoDB vendor endpoint so useVendors works unchanged.
 */
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
    } = req.query;

    // --- 1. Fetch all vendors from Odoo (live, no DB cache) ---
    const allVendors = await getVendors();

    // --- 2. Derive filter options from the actual fetched data ---
    const countries = [
      ...new Set(allVendors.map((v) => v.country).filter(Boolean)),
    ].sort();

    const sizes = [
      ...new Set(allVendors.map((v) => v.size).filter(Boolean)),
    ].sort();

    const badges = [
      ...new Set(allVendors.map((v) => v.badgeVOE).filter(Boolean)),
    ].sort();

    const services = [
      ...new Set(
        allVendors
          .flatMap((v) => (Array.isArray(v.services) ? v.services : []))
          .filter(Boolean),
      ),
    ].sort();

    const filters = { countries, sizes, badges, services };

    // filtersOnly=true is used by the hook on initial load to populate the sidebar
    if (filtersOnly === "true") {
      return res.json({ filters });
    }

    // --- 3. Apply optional search / filter params ---
    let filtered = allVendors;

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.country.toLowerCase().includes(q) ||
          (v.shortDescription &&
            v.shortDescription.toLowerCase().includes(q)) ||
          v.services.some((s) => s.toLowerCase().includes(q)),
      );
    }

    if (country) {
      const countryFilter = country
        .split(",")
        .map((c) => c.toLowerCase().trim());
      filtered = filtered.filter((v) =>
        countryFilter.includes((v.country || "").toLowerCase()),
      );
    }

    if (size) {
      const sizeFilter = size.split(",").map((s) => s.trim());
      filtered = filtered.filter((v) => sizeFilter.includes(v.size));
    }

    if (badge) {
      const badgeFilter = badge.split(",").map((b) => b.trim());
      filtered = filtered.filter((v) => badgeFilter.includes(v.badgeVOE));
    }

    // --- 4. Paginate ---
    const total = filtered.length;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;
    const vendors = filtered.slice(skip, skip + limitNum);

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
