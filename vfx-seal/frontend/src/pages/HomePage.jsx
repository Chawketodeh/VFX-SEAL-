import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import sealLogo from "../assets/seal.png";

export default function HomePage() {
  const { isLoggedIn, isAdmin, isApproved } = useAuth();

  const getStartedLink = isLoggedIn
    ? isAdmin
      ? "/admin"
      : isApproved
        ? "/vendors"
        : "/pending"
    : "/register";

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-particles">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>
        <div className="hero-glow" />
        <div className="hero-content">
          <div className="hero-badge"> VFX Operational Excellence</div>
          <h1 className="hero-title">
            The <span className="hero-accent">Gold Standard</span> for
            <br />
            VFX Vendor Certification
          </h1>
          <p className="hero-subtitle">
            VFX Seal is the definitive platform for VFX studios seeking
            certified, assessed, and trusted vendor partners. Gain access to a
            curated directory of VOE-certified vendors worldwide.
          </p>
          <div className="hero-cta">
            <Link
              to={getStartedLink}
              className="btn btn-primary btn-xl hero-btn"
            >
              <span className="hero-btn-glow" />
              {isLoggedIn ? "Go to Dashboard" : "Join the Club"}
            </Link>
            {!isLoggedIn && (
              <Link to="/login" className="btn btn-outline btn-xl">
                Sign In
              </Link>
            )}
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-value">85+</div>
              <div className="hero-stat-label">Countries</div>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <div className="hero-stat-value">360+</div>
              <div className="hero-stat-label">Feedback Certification</div>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="seal-logo-container">
            <img
              src={sealLogo}
              alt="VFX Seal Certification"
              className="seal-logo"
            />
          </div>
          <div className="score-cards">
            <div className="hero-card-stack">
              <div className="hero-float-card card-1">
                <div className="hfc-badge gold"> Gold</div>
                <div className="hfc-score">9.2</div>
                <div className="hfc-name">Example Studio</div>
              </div>
              <div className="hero-float-card card-2">
                <div className="hfc-badge silver"> Silver</div>
                <div className="hfc-score">7.8</div>
                <div className="hfc-name">VFX Partner</div>
              </div>
              <div className="hero-float-card card-3">
                <div className="hfc-badge gold"> Gold</div>
                <div className="hfc-score">9.5</div>
                <div className="hfc-name">Elite VFX</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Process</span>
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">
              From certification to collaboration — in three simple steps
            </p>
          </div>
          <div className="how-grid">
            <div className="how-card">
              <div className="how-card-number">01</div>
              <div className="how-card-icon">📋</div>
              <h3>VOE Assessment</h3>
              <p>
                VFX vendors undergo a comprehensive assessment across multiple
                operational categories, evaluated by industry experts.
              </p>
            </div>
            <div className="how-card">
              <div className="how-card-number">02</div>
              <div className="how-card-icon">🏅</div>
              <h3>Certification & Scoring</h3>
              <p>
                Based on assessment results, vendors receive a VOE Score and
                Badge level — Bronze, Silver, or Gold — reflecting their
                operational excellence.
              </p>
            </div>
            <div className="how-card">
              <div className="how-card-number">03</div>
              <div className="how-card-icon">🤝</div>
              <h3>Studio Discovery</h3>
              <p>
                VFX studios access the certified vendor directory, compare
                scores, read reviews, and select the best partners for their
                projects.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="trust-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Trust</span>
            <h2 className="section-title">Why VFX Seal?</h2>
            <p className="section-subtitle">
              The industry's most trusted vendor certification platform
            </p>
          </div>
          <div className="trust-grid">
            <div className="trust-card">
              <div className="trust-icon">🔒</div>
              <h3>Secure & Private</h3>
              <p>
                Enterprise-grade security. Only approved studios can access
                vendor data. JWT authentication and role-based access control.
              </p>
            </div>
            <div className="trust-card">
              <div className="trust-icon">📊</div>
              <h3>Data-Driven Decisions</h3>
              <p>
                Transparent scoring across multiple assessment categories.
                Detailed reports for informed vendor selection.
              </p>
            </div>
            <div className="trust-card">
              <div className="trust-icon">⭐</div>
              <h3>Community Reviews</h3>
              <p>
                Real feedback from verified studios. Read honest reviews and
                ratings to complement the VOE assessment data.
              </p>
            </div>
            <div className="trust-card">
              <div className="trust-icon">🌍</div>
              <h3>Global Network</h3>
              <p>
                Vendors across 35+ countries. Filter by region, size,
                specialization, and badge level to find the perfect match.
              </p>
            </div>
            <div className="trust-card">
              <div className="trust-icon">📄</div>
              <h3>Detailed Reports</h3>
              <p>
                Access full PDF assessment reports with granular skill-level
                breakdowns for every certified vendor.
              </p>
            </div>
            <div className="trust-card">
              <div className="trust-icon">🔄</div>
              <h3>Continuous Updates</h3>
              <p>
                Regular re-assessments ensure vendor certifications remain
                current and reflect operational reality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-glow" />
            <h2>Ready to Elevate Your VFX Partnerships?</h2>
            <p>
              Join hundreds of studios who trust VFX Seal to find the best
              certified vendors worldwide.
            </p>
            <div className="cta-buttons">
              <Link to={getStartedLink} className="btn btn-primary btn-xl">
                {isLoggedIn ? "Browse Vendors" : "Get Started — It's Free"}
              </Link>
              {!isLoggedIn && (
                <Link to="/login" className="btn btn-outline btn-xl">
                  Already a Member? Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

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
            <p className="footer-copy">
              © {new Date().getFullYear()} VFX Seal. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
