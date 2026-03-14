import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ContactModal from "../components/ContactModal";
import PublicNavbar from "../components/PublicNavbar";
import {
  VendorGridSkeleton,
  VendorFilterSkeleton,
} from "../components/VendorSkeleton";
import { useVendors } from "../hooks/useVendors";
import { FiAward, FiCircle, FiSearch, FiStar, FiMapPin } from "react-icons/fi";
import { FaTrophy } from "react-icons/fa";

const BADGE_ICONS = {
  Gold: <FaTrophy className="badge-icon gold" />,
  Silver: <FiAward className="badge-icon silver" />,
  Bronze: <FiCircle className="badge-icon bronze" />,
  Blue: <FiCircle className="badge-icon blue" />,
  None: "—",
};

export default function VendorsPage() {
  const navigate = useNavigate();
  const { isAdmin, isLoggedIn } = useAuth();
  const [contactOpen, setContactOpen] = useState(false);

  const {
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
  } = useVendors();

  const handleSearchChange = (e) => {
    updateSearch(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Search is automatically triggered by debounced input
  };

  const toggleFilter = (type, value) => {
    const newFilters = { ...activeFilters };
    const arr = newFilters[type];
    const updated = arr.includes(value)
      ? arr.filter((v) => v !== value)
      : [...arr, value];
    newFilters[type] = updated;
    updateFilters(newFilters);
  };

  const clearFilters = () => {
    updateFilters({ country: [], size: [], badge: [] });
    updateSearch("");
  };

  const badgeClass = (badge) => (badge || "none").toLowerCase();

  // Enhanced badge logic with Blue for new studios
  const getBadgeType = (vendor) => {
    if (!vendor) return "None";

    const currentYear = new Date().getFullYear();
    const isNew = vendor.foundedYear && currentYear - vendor.foundedYear < 2;

    if (isNew) return "Blue";
    return vendor.badgeVOE || "None";
  };

  const renderStars = (rating) => {
    return (
      <div className="stars stars-sm">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar
            key={star}
            className={`star ${star <= Math.round(rating) ? "filled" : ""}`}
            size={16}
          />
        ))}
      </div>
    );
  };

  // Generate a gradient background based on vendor badge
  const getCardGradient = (badge) => {
    switch (badge) {
      case "Gold":
        return "linear-gradient(135deg, rgba(201,163,79,0.15) 0%, rgba(201,163,79,0.03) 50%, transparent 100%)";
      case "Silver":
        return "linear-gradient(135deg, rgba(192,192,192,0.12) 0%, rgba(192,192,192,0.03) 50%, transparent 100%)";
      case "Bronze":
        return "linear-gradient(135deg, rgba(205,127,50,0.12) 0%, rgba(205,127,50,0.03) 50%, transparent 100%)";
      case "Blue":
        return "linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0.03) 50%, transparent 100%)";
      default:
        return "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 100%)";
    }
  };

  return (
    <div
      className="vendors-page"
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      {/* Public Navbar for non-logged-in users */}
      {!isLoggedIn && <PublicNavbar />}

      <div className="page-wrapper" style={{ flex: 1 }}>
        <div className="container">
          <div className="vendors-header slide-up">
            <div className="vendors-header-top">
              <div>
                <h1>VOE Certified Vendors</h1>
                <p>
                  Discover and evaluate top-tier VFX vendors worldwide,
                  certified by the VFX Operational Excellence program.
                </p>
              </div>
              {!isAdmin && (
                <button
                  className="btn btn-primary"
                  onClick={() => setContactOpen(true)}
                  id="contact-btn"
                >
                  Contact Us
                </button>
              )}
            </div>
          </div>

          <div className="vendors-layout">
            {/* Filter Sidebar */}
            <aside className="filter-sidebar fade-in">
              {loading && filters.countries.length === 0 ? (
                <VendorFilterSkeleton />
              ) : (
                <>
                  <div className="filter-title">
                    Filters
                    {(activeFilters.country.length > 0 ||
                      activeFilters.size.length > 0 ||
                      activeFilters.badge.length > 0) && (
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={clearFilters}
                        style={{ marginLeft: "auto", fontSize: "0.7rem" }}
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <form
                    onSubmit={handleSearchSubmit}
                    style={{ marginBottom: "var(--space-lg)" }}
                  >
                    <div className="search-bar">
                      <input
                        className="form-input"
                        placeholder="Search vendors..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        id="vendor-search"
                      />
                    </div>
                  </form>

                  {filters.countries && filters.countries.length > 0 && (
                    <div className="filter-group">
                      <div className="filter-group-title">Country</div>
                      {filters.countries.sort().map((c) => (
                        <div
                          key={c}
                          className={`filter-option ${activeFilters.country.includes(c) ? "active" : ""}`}
                          onClick={() => toggleFilter("country", c)}
                        >
                          <span className="filter-checkbox" />
                          {c}
                        </div>
                      ))}
                    </div>
                  )}

                  {filters.sizes && filters.sizes.length > 0 && (
                    <div className="filter-group">
                      <div className="filter-group-title">Size</div>
                      {["Micro", "Small", "Medium", "Large"]
                        .filter((s) => filters.sizes.includes(s))
                        .map((s) => (
                          <div
                            key={s}
                            className={`filter-option ${activeFilters.size.includes(s) ? "active" : ""}`}
                            onClick={() => toggleFilter("size", s)}
                          >
                            <span className="filter-checkbox" />
                            {s}
                          </div>
                        ))}
                    </div>
                  )}

                  {filters.badges && filters.badges.length > 0 && (
                    <div className="filter-group">
                      <div className="filter-group-title">VOE Badge</div>
                      {["Gold", "Silver", "Bronze", "Blue", "None"]
                        .filter((b) => filters.badges.includes(b))
                        .map((b) => (
                          <div
                            key={b}
                            className={`filter-option ${activeFilters.badge.includes(b) ? "active" : ""}`}
                            onClick={() => toggleFilter("badge", b)}
                          >
                            <span className="filter-checkbox" />
                            {BADGE_ICONS[b]} {b}
                          </div>
                        ))}
                    </div>
                  )}
                </>
              )}
            </aside>

            {/* Vendor List — Netflix Style */}
            <main>
              <div className="vendors-count">
                {pagination.total} vendor{pagination.total !== 1 ? "s" : ""}{" "}
                found
              </div>

              {loading ? (
                <VendorGridSkeleton count={9} />
              ) : error ? (
                <div className="alert alert-error">{error}</div>
              ) : vendors.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <FiSearch size={48} />
                  </div>
                  <h3>No vendors found</h3>
                  <p>Try adjusting your search or filters.</p>
                </div>
              ) : (
                <div className="netflix-grid">
                  {vendors.map((vendor) => {
                    const summary = feedbackSummaries[vendor._id] || {
                      avgRating: 0,
                      totalRatings: 0,
                    };
                    return (
                      <div
                        className="netflix-card slide-up"
                        key={vendor._id}
                        onClick={() => navigate(`/vendors/${vendor.slug}`)}
                        id={`vendor-${vendor.slug}`}
                        style={{
                          background: getCardGradient(getBadgeType(vendor)),
                        }}
                      >
                        {/* Hero Image / Logo */}
                        <div className="netflix-card-hero">
                          {vendor.logo ? (
                            <img
                              src={vendor.logo}
                              alt={vendor.name}
                              className="netflix-card-img"
                            />
                          ) : (
                            <div className="netflix-card-placeholder">
                              <span>{vendor.name.charAt(0)}</span>
                            </div>
                          )}
                          <div className="netflix-card-overlay">
                            <span
                              className={`voe-badge ${badgeClass(getBadgeType(vendor))}`}
                            >
                              <span className="voe-badge-icon">
                                {BADGE_ICONS[getBadgeType(vendor)] || "—"}
                              </span>
                              {getBadgeType(vendor)}
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="netflix-card-body">
                          <h3 className="netflix-card-name">{vendor.name}</h3>
                          <div className="netflix-card-meta">
                            <span>
                              <FiMapPin size={14} /> {vendor.country}
                            </span>
                            <span className="vendor-meta-dot" />
                            <span>{vendor.size}</span>
                          </div>

                          {vendor.shortDescription && (
                            <p className="netflix-card-desc">
                              {vendor.shortDescription}
                            </p>
                          )}

                          {vendor.services?.length > 0 && (
                            <div className="netflix-card-services">
                              {vendor.services.slice(0, 3).map((s) => (
                                <span className="service-tag" key={s}>
                                  {s}
                                </span>
                              ))}
                              {vendor.services.length > 3 && (
                                <span
                                  className="service-tag"
                                  style={{ opacity: 0.6 }}
                                >
                                  +{vendor.services.length - 3}
                                </span>
                              )}
                            </div>
                          )}

                          <div className="netflix-card-footer">
                            <div className="netflix-card-score">
                              <div className="netflix-score-ring">
                                <span className="netflix-score-val">
                                  {vendor.globalScore?.toFixed(1)}
                                </span>
                              </div>
                              <span className="netflix-score-label">VOE</span>
                            </div>
                            <div className="netflix-card-rating">
                              {summary.totalRatings > 0 ? (
                                <>
                                  {renderStars(summary.avgRating)}
                                  <span className="netflix-rating-info">
                                    {summary.avgRating.toFixed(1)} (
                                    {summary.totalRatings})
                                  </span>
                                </>
                              ) : (
                                <span className="netflix-no-reviews">
                                  No reviews yet
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </main>
          </div>
        </div>

        <ContactModal
          isOpen={contactOpen}
          onClose={() => setContactOpen(false)}
        />
      </div>
      {/* Footer */}
      <footer className="home-footer">
        <div className="container">
          <div className="footer-inner">
            <div className="footer-brand">
              VFX <span className="accent">Seal</span>
            </div>
            <div className="footer-links">
              <Link to="/">Home</Link>
              <Link to="/contact">Contact</Link>
              {!isLoggedIn && <Link to="/login">Login</Link>}
            </div>
            <div className="footer-copy">
              <div className="footer-copyright">
                © The Seal — All rights reserved
              </div>
              <div className="footer-legal">
                <Link to="/terms" className="footer-legal-link">
                  Terms & Conditions
                </Link>
                <span className="footer-separator">•</span>
                <Link to="/privacy-policy" className="footer-legal-link">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
