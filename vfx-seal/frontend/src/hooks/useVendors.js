import { useState, useEffect, useCallback, useMemo } from "react";
import api from "../api/client";

// Debounce hook
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Cache for API responses
const cache = new Map();
const inFlightRequests = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCacheKey = (url, params) => {
  const searchParams = new URLSearchParams(params);
  return `${url}?${searchParams.toString()}`;
};

const isExpired = (timestamp) => {
  return Date.now() - timestamp > CACHE_DURATION;
};

// Enhanced vendors hook with caching and optimization
export const useVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [feedbackSummaries, setFeedbackSummaries] = useState({});
  const [filters, setFilters] = useState({
    countries: [],
    sizes: [],
    badges: [],
    services: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState({
    country: [],
    size: [],
    badge: [],
  });
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  // Debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Memoized parameters for API calls
  const fetchParams = useMemo(
    () => ({
      eligibility: "strict-vendor-v2",
      search: debouncedSearchTerm,
      country: activeFilters.country.join(","),
      size: activeFilters.size.join(","),
      badge: activeFilters.badge.join(","),
      page: pagination.page,
    }),
    [debouncedSearchTerm, activeFilters, pagination.page],
  );

  // Fetch vendors with caching
  const fetchVendors = useCallback(
    async (params = fetchParams) => {
      setLoading(true);
      setError(null);

      const cacheKey = getCacheKey("/odoo/vendors", params);
      const cached = cache.get(cacheKey);

      if (cached && !isExpired(cached.timestamp)) {
        setVendors(cached.data.vendors);
        if (cached.data.filters) {
          setFilters(cached.data.filters);
        }
        setPagination({
          page: cached.data.page,
          totalPages: cached.data.totalPages,
          total: cached.data.total,
        });
        setLoading(false);
        return;
      }

      try {
        const cleanParams = Object.fromEntries(
          Object.entries(params).filter(([_, value]) => value && value !== ""),
        );

        let requestPromise = inFlightRequests.get(cacheKey);
        if (!requestPromise) {
          requestPromise = api.get("/odoo/vendors", {
            params: cleanParams,
          });
          inFlightRequests.set(cacheKey, requestPromise);
        }

        const response = await requestPromise;
        const data = response.data;

        setVendors(data.vendors);
        if (data.filters) {
          setFilters(data.filters);
        }
        setPagination({
          page: data.page,
          totalPages: data.totalPages,
          total: data.total,
        });

        // Cache the result
        cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error("Failed to fetch vendors:", error);
        setError(
          error?.response?.data?.message ||
            "Failed to load vendors from Odoo service",
        );
      } finally {
        inFlightRequests.delete(cacheKey);
        setLoading(false);
      }
    },
    [fetchParams],
  );

  // Fetch feedback summaries with vendor-specific caching
  const fetchFeedbackSummaries = useCallback(async (vendorIds) => {
    if (!vendorIds || vendorIds.length === 0) return;

    const cacheKey = `feedback-summaries-${vendorIds.sort().join(",")}`;
    const cached = cache.get(cacheKey);

    if (cached && !isExpired(cached.timestamp)) {
      setFeedbackSummaries((prev) => ({ ...prev, ...cached.data }));
      return;
    }

    try {
      const response = await api.get("/feedbacks/summaries", {
        params: { vendorIds: vendorIds.join(",") },
      });
      const summaries = response.data.summaries;

      setFeedbackSummaries((prev) => ({ ...prev, ...summaries }));

      // Cache the result
      cache.set(cacheKey, {
        data: summaries,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("Failed to fetch feedback summaries:", error);
    }
  }, []);

  // Fetch vendors when parameters change
  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  // Fetch feedback summaries when vendors change
  useEffect(() => {
    if (vendors.length > 0) {
      const vendorIds = vendors.map((vendor) => vendor._id);
      fetchFeedbackSummaries(vendorIds);
    }
  }, [vendors, fetchFeedbackSummaries]);

  // Update search term
  const updateSearch = useCallback((term) => {
    setSearchTerm(term);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  // Update active filters
  const updateFilters = useCallback((newFilters) => {
    setActiveFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  // Change page
  const changePage = useCallback((newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  }, []);

  // Clear cache (useful for data refresh)
  const clearCache = useCallback(() => {
    cache.clear();
  }, []);

  return {
    vendors,
    feedbackSummaries,
    filters,
    loading,
    error,
    searchTerm,
    activeFilters,
    pagination,
    updateSearch,
    updateFilters,
    changePage,
    clearCache,
    refetch: () => fetchVendors(fetchParams),
  };
};
