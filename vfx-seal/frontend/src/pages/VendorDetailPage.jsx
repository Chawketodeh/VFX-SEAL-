import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/client";
import FeedbackSection from "../components/FeedbackSection";
import {
  FiAward,
  FiCircle,
  FiPlay,
  FiFileText,
  FiCheck,
  FiMapPin,
  FiUsers,
  FiExternalLink,
} from "react-icons/fi";
import { FaTrophy } from "react-icons/fa";

const BADGE_ICONS = {
  Gold: <FaTrophy className="badge-icon gold" />,
  Silver: <FiAward className="badge-icon silver" />,
  Bronze: <FiCircle className="badge-icon bronze" />,
  Blue: <FiCircle className="badge-icon blue" />,
  None: "—",
};

export default function VendorDetailPage() {
  const { slug } = useParams();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openSections, setOpenSections] = useState({});

  // Enhanced badge logic with Blue for new studios
  const getBadgeType = (vendor) => {
    if (!vendor) return "None";

    const currentYear = new Date().getFullYear();
    const isNew = vendor.foundedYear && currentYear - vendor.foundedYear < 2;

    if (isNew) return "Blue";
    return vendor.badgeVOE || "None";
  };

  const badgeClass = (badge) => (badge || "none").toLowerCase();

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const { data } = await api.get(`/vendors/${slug}`);
        setVendor(data.vendor);
        if (data.vendor.assessment?.length > 0) {
          setOpenSections({ 0: true });
        }
      } catch (err) {
        setError(err.response?.data?.message || "Vendor not found");
      } finally {
        setLoading(false);
      }
    };
    fetchVendor();
  }, [slug]);

  const toggleSection = (index) => {
    setOpenSections((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const expandAll = () => {
    if (!vendor.assessment) return;
    const allOpen = {};
    vendor.assessment.forEach((_, idx) => {
      allOpen[idx] = true;
    });
    setOpenSections(allOpen);
  };

  const collapseAll = () => {
    setOpenSections({});
  };

  const handleDownloadPdf = async () => {
    try {
      const response = await api.get(`/vendors/${vendor._id}/pdf`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" }),
      );
      window.open(url, "_blank");
    } catch (err) {
      alert(err.response?.data?.message || "Unable to access PDF report");
    }
  };

  const scorePercent = vendor ? (vendor.globalScore / 10) * 100 : 0;

  if (loading)
    return (
      <div className="page-wrapper">
        <div className="loading">
          <div className="spinner" />
        </div>
      </div>
    );
  if (error)
    return (
      <div className="page-wrapper">
        <div className="container">
          <Link to="/vendors" className="back-link">
            ← Back to Vendors
          </Link>
          <div className="alert alert-error">{error}</div>
        </div>
      </div>
    );

  return (
    <div className="vendor-detail-page">
      <div className="page-wrapper">
        <div className="container">
          <div className="vendor-detail fade-in">
            <Link to="/vendors" className="back-link" id="back-to-vendors">
              ← Back to Vendors
            </Link>

            {/* Header */}
            <div className="vendor-detail-header">
              <div className="vendor-detail-logo">
                {vendor.logo ? (
                  <img src={vendor.logo} alt={vendor.name} />
                ) : (
                  vendor.name.charAt(0)
                )}
              </div>
              <div className="vendor-detail-info">
                <h1 className="vendor-detail-name">
                  {vendor.name}
                  <span
                    className={`voe-badge ${badgeClass(getBadgeType(vendor))}`}
                  >
                    <span className="voe-badge-icon">
                      {BADGE_ICONS[getBadgeType(vendor)] || "—"}
                    </span>
                    {getBadgeType(vendor)}
                  </span>
                </h1>
                <div className="vendor-detail-meta">
                  <span className="vendor-detail-meta-item">
                    <FiMapPin size={14} /> {vendor.country}
                  </span>
                  <span className="vendor-detail-meta-item">
                    <FiUsers size={14} /> {vendor.size}
                  </span>
                  {vendor.foundedYear && (
                    <span className="vendor-detail-meta-item">
                      Est. {vendor.foundedYear}
                    </span>
                  )}
                  {vendor.website && (
                    <span className="vendor-detail-meta-item">
                      <FiExternalLink size={14} />{" "}
                      <a
                        href={vendor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Website
                      </a>
                    </span>
                  )}
                  {vendor.demoReel && (
                    <span className="vendor-detail-meta-item">
                      <FiPlay size={16} style={{ marginRight: "4px" }} />
                      <a
                        href={vendor.demoReel}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Demo Reel
                      </a>
                    </span>
                  )}
                </div>
                {vendor.shortDescription && (
                  <p className="vendor-detail-desc">
                    {vendor.shortDescription}
                  </p>
                )}
                {vendor.services?.length > 0 && (
                  <div className="vendor-services">
                    {vendor.services.map((s) => (
                      <span className="service-tag" key={s}>
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="vendor-detail-score-container">
                <div
                  className="score-ring"
                  style={{ "--score-percent": scorePercent }}
                >
                  <div className="score-ring-inner">
                    <span className="score-ring-value">
                      {vendor.globalScore?.toFixed(1)}
                    </span>
                    <span className="score-ring-label">VOE Score</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feedback & Rating Section — Collapsible Accordion */}
            <FeedbackSection vendorId={vendor._id} vendorName={vendor.name} />

            {/* Assessment Sections */}
            {vendor.assessment?.length > 0 && (
              <>
                <div className="vendor-detail-section-title">
                  <FiFileText size={16} style={{ marginRight: "8px" }} />
                  VOE Assessment — {vendor.assessment.length} Sections
                </div>

                {/* Global Control Buttons */}
                <div className="assessment-controls">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={expandAll}
                  >
                    Expand All
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={collapseAll}
                  >
                    Collapse All
                  </button>
                </div>

                <div className="accordion">
                  {vendor.assessment.map((section, idx) => (
                    <div
                      className={`accordion-item ${openSections[idx] ? "open" : ""}`}
                      key={idx}
                    >
                      <div
                        className="accordion-header"
                        onClick={() => toggleSection(idx)}
                        id={`section-${idx}`}
                      >
                        <div className="accordion-header-left">
                          <span className="accordion-section-name">
                            {section.sectionName}
                          </span>
                          <span className="accordion-score">
                            {section.score.toFixed(1)} / 10
                          </span>
                        </div>
                        <span className="accordion-chevron">▼</span>
                      </div>
                      <div className="accordion-body">
                        <div className="accordion-content">
                          {section.validatedSkills?.length > 0 && (
                            <div className="skills-section">
                              <div className="skills-section-title validated">
                                <FiCheck
                                  size={14}
                                  style={{ marginRight: "4px" }}
                                />
                                Validated by VOE
                              </div>
                              <div className="skills-list">
                                {section.validatedSkills.map((s) => (
                                  <span
                                    className="skill-chip validated"
                                    key={s}
                                  >
                                    <FiCheck
                                      size={14}
                                      style={{ marginRight: "4px" }}
                                    />
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {section.unverifiedSkills?.length > 0 && (
                            <div className="skills-section">
                              <div className="skills-section-title unverified">
                                ⚠ Declared — Not Verified
                              </div>
                              <div className="skills-list">
                                {section.unverifiedSkills.map((s) => (
                                  <span
                                    className="skill-chip unverified"
                                    key={s}
                                  >
                                    ⚠ {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {section.nonValidatedSkills?.length > 0 && (
                            <div className="skills-section">
                              <div className="skills-section-title nonvalidated">
                                ✗ Not Validated
                              </div>
                              <div className="skills-list">
                                {section.nonValidatedSkills.map((s) => (
                                  <span
                                    className="skill-chip nonvalidated"
                                    key={s}
                                  >
                                    ✗ {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* PDF Report */}
            {vendor.pdfReport?.filePath && (
              <div className="vendor-detail-pdf">
                <div className="vendor-detail-pdf-info">
                  <h4>📄 VOE Assessment Report</h4>
                  <p>Full detailed report for {vendor.name}</p>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={handleDownloadPdf}
                  id="download-pdf-btn"
                >
                  📥 View / Download PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
