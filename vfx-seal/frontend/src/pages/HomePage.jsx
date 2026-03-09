import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PublicNavbar from "../components/PublicNavbar";
import sealLogo from "../assets/seal.png";
import registerstep from "../assets/register-step.avif";
import verificationstep from "../assets/verification-step.jfif";
import Confidentialitystep from "../assets/Confidentiality-step.jpg";
import explorstep from "../assets/Explore-step.avif";
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
      {/* Public Navbar for non-logged-in users */}
      {!isLoggedIn && <PublicNavbar />}

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
        <div className="hero-glow-frame">
          <div className="hero-glow" />
        </div>
        <div className="hero-content">
          <div className="hero-badge"> VFX Operational Excellence</div>
          <h1 className="hero-title">
            The <span className="hero-accent">Trusted </span> Gateway
            <br />
            to find VFX vendors.
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
        </div>
        <div className="hero-visual">
          <div className="seal-logo-container">
            <img
              src={sealLogo}
              alt="VFX Seal Certification"
              className="seal-logo"
            />
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
                  src={explorstep}
                  alt="Modern architecture corridor"
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
            <div className="how-card-enhanced">
              <div className="how-card-number">04</div>
              <div className="how-card-image">
                <img
                  src={Confidentialitystep}
                  alt="Earth from space with city lights"
                  className="step-image"
                />
              </div>
              <h3>Confidence</h3>
              <p>
                All information is strictly for your internal use and must not
                be shared externally.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vendor Showcase - Connected to Explore Step */}
      <section className="vendor-showcase-section">
        <div className="container">
          <div className="showcase-header">
            <span className="section-tag">Preview</span>
            <h2 className="section-title">Discover Top-Rated VFX Studios</h2>
            <p className="section-subtitle">
              Get a glimpse of the certified vendors in our exclusive network
            </p>
          </div>

          <div className="vendor-showcase-grid">
            <div className="showcase-vendor-card">
              <div className="vendor-showcase-header">
                <div className="vendor-showcase-logo">IL</div>
                <div className="vendor-showcase-info">
                  <h3>ILM Studios</h3>
                  <span className="vendor-location">San Francisco, USA</span>
                </div>
                <div className="voe-score-badge gold">
                  <span className="score">9.2</span>
                  <span className="max">/10</span>
                </div>
              </div>
              <div className="vendor-showcase-services">
                <span className="service-tag">VFX Supervision</span>
                <span className="service-tag">Compositing</span>
                <span className="service-tag">3D Animation</span>
              </div>
            </div>

            <div className="showcase-vendor-card">
              <div className="vendor-showcase-header">
                <div className="vendor-showcase-logo">DN</div>
                <div className="vendor-showcase-info">
                  <h3>Double Negative</h3>
                  <span className="vendor-location">London, UK</span>
                </div>
                <div className="voe-score-badge gold">
                  <span className="score">8.9</span>
                  <span className="max">/10</span>
                </div>
              </div>
              <div className="vendor-showcase-services">
                <span className="service-tag">Environment VFX</span>
                <span className="service-tag">Creature Work</span>
                <span className="service-tag">Matte Painting</span>
              </div>
            </div>

            <div className="showcase-vendor-card">
              <div className="vendor-showcase-header">
                <div className="vendor-showcase-logo">WE</div>
                <div className="vendor-showcase-info">
                  <h3>Weta Digital</h3>
                  <span className="vendor-location">Wellington, NZ</span>
                </div>
                <div className="voe-score-badge gold">
                  <span className="score">9.5</span>
                  <span className="max">/10</span>
                </div>
              </div>
              <div className="vendor-showcase-services">
                <span className="service-tag">Motion Capture</span>
                <span className="service-tag">Digital Humans</span>
                <span className="service-tag">Real-time VFX</span>
              </div>
            </div>

            <div className="showcase-vendor-card">
              <div className="vendor-showcase-header">
                <div className="vendor-showcase-logo">FR</div>
                <div className="vendor-showcase-info">
                  <h3>Framestore</h3>
                  <span className="vendor-location">London, UK</span>
                </div>
                <div className="voe-score-badge silver">
                  <span className="score">8.7</span>
                  <span className="max">/10</span>
                </div>
              </div>
              <div className="vendor-showcase-services">
                <span className="service-tag">Character Animation</span>
                <span className="service-tag">Virtual Production</span>
                <span className="service-tag">Post-Production</span>
              </div>
            </div>
          </div>

          <div className="showcase-cta">
            <div className="showcase-blur-overlay">
              <div className="showcase-unlock-message">
                <h3>Join The Seal to Access Full Network</h3>
                <p>Get verified access to certified VFX vendors worldwide</p>
                <Link to={getStartedLink} className="btn btn-primary btn-lg">
                  {isLoggedIn ? "Browse All Vendors" : "Request Access"}
                </Link>
              </div>
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
                {isLoggedIn ? "Browse Vendors" : "Get Started"}
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
