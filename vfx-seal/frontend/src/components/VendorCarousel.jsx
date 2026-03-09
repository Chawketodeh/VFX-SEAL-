import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiChevronLeft,
  FiChevronRight,
  FiAward,
  FiCircle,
  FiMapPin,
  FiUsers,
} from "react-icons/fi";
import { FaTrophy } from "react-icons/fa";

const BADGE_ICONS = {
  Gold: <FaTrophy className="badge-icon gold" />,
  Silver: <FiAward className="badge-icon silver" />,
  Bronze: <FiCircle className="badge-icon bronze" />,
  Blue: <FiCircle className="badge-icon blue" />,
  None: "—",
};

export default function VendorCarousel({ title, vendors, category }) {
  const scrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction) => {
    const container = scrollRef.current;
    if (!container) return;

    const scrollAmount = 320; // Width of one card + gap
    const newScrollLeft =
      direction === "left"
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newScrollLeft,
      behavior: "smooth",
    });
  };

  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (container) {
      handleScroll(); // Initial check
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [vendors]);

  const getBadgeType = (vendor) => {
    // New logic: Blue for new studios (< 2 years), then Bronze/Silver/Gold based on validation
    const currentYear = new Date().getFullYear();
    const isNew = vendor.foundedYear && currentYear - vendor.foundedYear < 2;

    if (isNew) return "Blue";
    return vendor.badgeVOE || "None";
  };

  const getTeamSizeNumber = (size) => {
    const sizeMap = {
      Micro: "1-10",
      Small: "11-50",
      Medium: "51-200",
      Large: "200+",
    };
    return sizeMap[size] || size;
  };

  if (!vendors || vendors.length === 0) {
    return null;
  }

  return (
    <div className="vendor-carousel-section">
      <div className="carousel-header">
        <h3 className="carousel-title">{title}</h3>
        <div className="carousel-navigation">
          <button
            className={`carousel-nav-btn ${!showLeftArrow ? "disabled" : ""}`}
            onClick={() => scroll("left")}
            disabled={!showLeftArrow}
          >
            <FiChevronLeft size={20} />
          </button>
          <button
            className={`carousel-nav-btn ${!showRightArrow ? "disabled" : ""}`}
            onClick={() => scroll("right")}
            disabled={!showRightArrow}
          >
            <FiChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="carousel-container">
        <div className="carousel-track" ref={scrollRef} onScroll={handleScroll}>
          {vendors.map((vendor) => {
            const badgeType = getBadgeType(vendor);

            return (
              <Link
                to={`/vendors/${vendor.slug}`}
                key={vendor._id}
                className="carousel-vendor-card"
              >
                <div className="carousel-card-inner">
                  {/* Studio Logo/Avatar */}
                  <div className="carousel-vendor-logo">
                    {vendor.logo ? (
                      <img src={vendor.logo} alt={vendor.name} />
                    ) : (
                      <span className="logo-placeholder">
                        {vendor.name.charAt(0)}
                      </span>
                    )}
                  </div>

                  {/* Studio Info */}
                  <div className="carousel-vendor-info">
                    <h4 className="carousel-vendor-name">{vendor.name}</h4>
                    <div className="carousel-vendor-meta">
                      <span className="carousel-location">
                        <FiMapPin size={14} /> {vendor.country}
                      </span>
                      <span className="carousel-team-size">
                        <FiUsers size={14} /> {getTeamSizeNumber(vendor.size)}
                      </span>
                    </div>

                    {/* VOE Score */}
                    <div className="carousel-score-container">
                      <div
                        className={`carousel-score-badge ${badgeType.toLowerCase()}`}
                      >
                        <span className="score">
                          {vendor.globalScore?.toFixed(1) || "N/A"}
                        </span>
                        <span className="max">/10</span>
                      </div>
                      <div
                        className={`carousel-badge ${badgeType.toLowerCase()}`}
                      >
                        <span className="badge-icon-wrapper">
                          {BADGE_ICONS[badgeType]}
                        </span>
                        <span className="badge-text">{badgeType}</span>
                      </div>
                    </div>

                    {/* Services Preview */}
                    {vendor.services && vendor.services.length > 0 && (
                      <div className="carousel-services">
                        {vendor.services.slice(0, 3).map((service, idx) => (
                          <span key={idx} className="carousel-service-tag">
                            {service}
                          </span>
                        ))}
                        {vendor.services.length > 3 && (
                          <span className="carousel-service-more">
                            +{vendor.services.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
