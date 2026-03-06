import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import sealLogo from "../assets/seal.png";
import registerstep from "../assets/register-step.avif";
import verificationstep from "../assets/verification-step.jfif";
import approvedstep from "../assets/approved-step.avif";
import explorstep from "../assets/explore-step.avif";
import AssessorsSection from "../components/AssessorsSection";
import aboutImage from "../assets/about-image.webp";

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
              From registration to exploration — your journey to verified VFX
              partnerships
            </p>
          </div>
          <div className="how-grid-enhanced">
            <div className="how-card-enhanced">
              <div className="how-card-number">01</div>
              <div className="how-card-image">
                <img
                  src={registerstep}
                  alt="Developer coding screen"
                  className="step-image"
                />
              </div>
              <h3>Register</h3>
              <p>
                Sign up using your official company email, specifying your role
                and region.
              </p>
            </div>
            <div className="how-card-enhanced">
              <div className="how-card-number">02</div>
              <div className="how-card-image">
                <img
                  src={verificationstep}
                  alt="Team review and validation"
                  className="step-image"
                />
              </div>
              <h3>Verification</h3>
              <p>
                Our team manually reviews and verifies each profile to ensure
                exclusivity and security.
              </p>
            </div>
            <div className="how-card-enhanced">
              <div className="how-card-number">03</div>
              <div className="how-card-image">
                <img
                  src={approvedstep}
                  alt="Modern architecture corridor"
                  className="step-image"
                />
              </div>
              <h3>Approved</h3>
              <p>
                Access is granted exclusively to decision-makers from verified
                VFX studios.
              </p>
            </div>
            <div className="how-card-enhanced">
              <div className="how-card-number">04</div>
              <div className="how-card-image">
                <img
                  src={explorstep}
                  alt="Earth from space with city lights"
                  className="step-image"
                />
              </div>
              <h3>Explore</h3>
              <p>
                Discover certified VFX vendors through detailed profiles, VOE
                scores, and independent audit reports. Your research and
                activity remain strictly confidential.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Assessor Network Section */}
      <AssessorsSection />

      {/* About The Seal Section - Editorial Layout */}
      <section className="about-section-editorial">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">About</span>
            <h2 className="section-title">About The Seal</h2>
            <p className="section-subtitle">
              The industry's most trusted vendor certification platform
            </p>
          </div>

          <div className="about-editorial-layout">
            {/* Left Column - Content */}
            <div className="about-content-column">
              {/* Highlight Introduction Box */}
              <div className="about-highlight-box">
                <p>
                  The Seal is an exclusive platform designed specifically for
                  VFX studio executives. Our mission is to connect you with the
                  industry's top vendors, each certified through the VOE (VFX
                  Operational Excellence) label.
                </p>
              </div>

              {/* Feature List */}
              <div className="about-features-list">
                <div className="about-feature-item">
                  <div className="feature-separator"></div>
                  <div className="feature-content">
                    <h3>Exclusive</h3>
                    <p>
                      Access limited to verified VFX studios and
                      decision-makers. Our exclusive membership ensures
                      high-quality networking and trusted partnerships.
                    </p>
                  </div>
                </div>

                <div className="about-feature-item">
                  <div className="feature-separator"></div>
                  <div className="feature-content">
                    <h3>No-Paywall Access</h3>
                    <p>
                      Complete access to vendor profiles, scores, and reports at
                      no cost. We believe quality information should be freely
                      available to industry professionals.
                    </p>
                  </div>
                </div>

                <div className="about-feature-item">
                  <div className="feature-separator"></div>
                  <div className="feature-content">
                    <h3>Certified Vendor Network</h3>
                    <p>
                      Every vendor undergoes rigorous VOE assessment.
                      Multi-category evaluation ensures you work with
                      operationally excellent partners.
                    </p>
                  </div>
                </div>

                <div className="about-feature-item">
                  <div className="feature-separator"></div>
                  <div className="feature-content">
                    <h3>Direct Access & Full Autonomy</h3>
                    <p>
                      Browse, compare, and contact vendors directly. No
                      intermediaries, no commissions, no restrictions on your
                      business relationships.
                    </p>
                  </div>
                </div>

                <div className="about-feature-item">
                  <div className="feature-separator"></div>
                  <div className="feature-content">
                    <h3>Strict Data Privacy & Confidentiality</h3>
                    <p>
                      Enterprise-grade security protects your information.
                      Vendors only see company name and logo — no personal
                      details or contact information shared.
                    </p>
                  </div>
                </div>

                <div className="about-feature-item">
                  <div className="feature-separator"></div>
                  <div className="feature-content">
                    <h3>360° Improvement & Vendor Comparison</h3>
                    <p>
                      Comprehensive scoring across all operational areas.
                      Detailed breakdowns help you identify the perfect match
                      for specific project requirements.
                    </p>
                  </div>
                </div>

                <div className="about-feature-item">
                  <div className="feature-separator"></div>
                  <div className="feature-content">
                    <h3>Reliable, Verified Information</h3>
                    <p>
                      All vendor data verified through independent assessment.
                      Regular re-evaluations ensure information remains current
                      and accurate.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Premium Image */}
            <div className="about-image-column">
              <div className="about-feature-image">
                <img
                  src={aboutImage}
                  alt="Modern architecture spiral staircase"
                  className="about-main-image"
                />
              </div>
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
