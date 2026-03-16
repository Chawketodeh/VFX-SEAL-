import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PublicNavbar from "../components/PublicNavbar";
import VendorDiscovery from "../components/VendorDiscovery";
import sealLogo from "../assets/seal.png";
import registerstep from "../assets/register-step.avif";
import verificationstep from "../assets/verification-step.jfif";
import AssessorsSection from "../components/AssessorsSection";
import aboutImage from "../assets/about-image.webp";

const explorstep =
  "https://images.unsplash.com/photo-1487014679447-9f8336841d58?auto=format&fit=crop&w=1200&q=80";
const feedbackstep =
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80";

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
          <h1 className="hero-title">
            The <span className="hero-accent">Trusted </span> Gateway
            <br />
            to find VFX vendors.
          </h1>
          <p className="hero-subtitle">
            VFX Seal helps VFX professionals discover certified, assessed, and
            trusted vendor partners. Explore in confidence and decide when to
            activate your trusted professional profile.
          </p>
          <div className="hero-cta">
            <Link
              to={getStartedLink}
              className="btn btn-primary btn-xl hero-btn"
            >
              <span className="hero-btn-glow" />
              {isLoggedIn ? "Go to Dashboard" : "Join the Club"}
            </Link>
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
                  alt="Secure browsing and exploration interface"
                  className="step-image"
                />
              </div>
              <h3>Explore </h3>
              <p>
                Once approved, you can freely browse the VFX marketplace. Your
                research and activity remain strictly confidential.
              </p>
            </div>
            <div className="how-card-enhanced">
              <div className="how-card-number">04</div>
              <div className="how-card-image">
                <img
                  src={feedbackstep}
                  alt="Community communication and feedback exchange"
                  className="step-image"
                />
              </div>
              <h3>Reach & 360° Feedback</h3>
              <p>
                Reach out to vendors directly, outside the platform – no
                intermediaries, no commissions – and contribute to the feedback
                community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vendor Discovery Section - Netflix-style for logged in users */}
      {isLoggedIn && isApproved ? (
        <VendorDiscovery />
      ) : (
        /* Locked Preview Section for non-logged-in users */
        <section className="vendor-showcase-section">
          <div className="container">
            <div className="showcase-header">
              <span className="section-tag">Exclusive Preview</span>
              <h2 className="section-title">
                Preview Our Certified Vendor Network
              </h2>
              <p className="section-subtitle">
                Get a glimpse of the industry's most trusted VFX partners
              </p>
            </div>

            <div className="vendor-showcase-grid">
              <div className="showcase-vendor-card locked-preview">
                <div className="vendor-showcase-header">
                  <div className="vendor-showcase-logo">JD</div>
                  <div className="vendor-showcase-info">
                    <h3 className="masked-vendor-name">John Doe Studio</h3>
                    <span className="vendor-location">Los Angeles, USA</span>
                  </div>
                  <div className="voe-score-badge gold preview-stars-badge">
                    <span className="star-rating-preview">★★★★★</span>
                  </div>
                </div>
                <div className="vendor-showcase-services">
                  <span className="service-tag">VFX Supervision</span>
                  <span className="service-tag">Compositing</span>
                  <span className="service-tag blurred">3D Animation</span>
                </div>
                <div className="vendor-locked-details">
                  <div className="locked-content">
                    <div className="locked-item">Portfolio Details</div>
                    <div className="locked-item">Contact Information</div>
                    <div className="locked-item">Pricing Structure</div>
                  </div>
                </div>
              </div>

              <div className="showcase-vendor-card locked-preview">
                <div className="vendor-showcase-header">
                  <div className="vendor-showcase-logo">NP</div>
                  <div className="vendor-showcase-info">
                    <h3 className="masked-vendor-name">North Pixel Studio</h3>
                    <span className="vendor-location">Vancouver, Canada</span>
                  </div>
                  <div className="voe-score-badge gold preview-stars-badge">
                    <span className="star-rating-preview">★★★★★</span>
                  </div>
                </div>
                <div className="vendor-showcase-services">
                  <span className="service-tag">Environment VFX</span>
                  <span className="service-tag blurred">Creature Work</span>
                  <span className="service-tag blurred">Matte Painting</span>
                </div>
                <div className="vendor-locked-details">
                  <div className="locked-content">
                    <div className="locked-item">Recent Projects</div>
                    <div className="locked-item">Team Capacity</div>
                    <div className="locked-item">Availability Status</div>
                  </div>
                </div>
              </div>

              <div className="showcase-vendor-card locked-preview">
                <div className="vendor-showcase-header">
                  <div className="vendor-showcase-logo">AL</div>
                  <div className="vendor-showcase-info">
                    <h3 className="masked-vendor-name">Alpha VFX Lab</h3>
                    <span className="vendor-location">London, UK</span>
                  </div>
                  <div className="voe-score-badge gold preview-stars-badge">
                    <span className="star-rating-preview">★★★★★</span>
                  </div>
                </div>
                <div className="vendor-showcase-services">
                  <span className="service-tag">Motion Capture</span>
                  <span className="service-tag blurred">Digital Humans</span>
                  <span className="service-tag blurred">Real-time VFX</span>
                </div>
                <div className="vendor-locked-details">
                  <div className="locked-content">
                    <div className="locked-item">Pipeline Details</div>
                    <div className="locked-item">Technical Specs</div>
                    <div className="locked-item">Partnership Terms</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="showcase-unlock-cta">
              <div className="unlock-content">
                <h3 className="unlock-title">
                  Unlock the Full Vendor Directory
                </h3>
                <p className="unlock-description">
                  Access certified VFX vendors, trusted partners, operational
                  scores, and exclusive directory insights reserved for approved
                  members.
                </p>
                <div className="unlock-actions">
                  <Link to="/register" className="btn btn-primary-gold btn-lg">
                    Join the Club
                  </Link>
                </div>
                <p className="unlock-exclusivity">
                  Exclusive access for approved professionals and partners
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Assessor Network Section */}
      <AssessorsSection />

      {/* About The Seal Section - Editorial Layout */}
      <section className="about-section-editorial">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">About</span>
            <h2 className="section-title">About The Seal</h2>
            <p className="section-subtitle">
              The industry's trusted vendor platform
            </p>
          </div>

          <div className="about-editorial-layout">
            {/* Left Column - Content */}
            <div className="about-content-column">
              {/* Highlight Introduction Box */}
              <div className="about-highlight-box">
                {/* prettier-ignore */}
                <p>
                  The Seal is an exclusive platform designed specifically for VFX studio executives. 

                  </p>
                <br />
                <p>
                  Our mission is to help you search, compare and evaluate VFX
                  vendors with full transparency on the information displayed.
                  It is the only platform where you can access VFX vendor
                  profiles and see clearly what is verified, including
                  VOE‑audited reports and additional company information.
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
                      no cost for studios. We believe quality information should
                      be freely available to industry professionals.
                    </p>
                  </div>
                </div>

                <div className="about-feature-item">
                  <div className="feature-separator"></div>
                  <div className="feature-content">
                    <h3>Verified & Certified Vendor Network</h3>
                    <p>
                      The Seal brings together different levels of verification.
                      VOE‑audited vendors are clearly identified as certified,
                      while self‑assessed and non‑audited information is also
                      available and transparently labelled.
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
                    <h3>360° Insight & Vendor Comparison</h3>
                    <p>
                      Granular scoring and qualitative information across key
                      operational areas help you benchmark vendors and identify
                      the best match for each project.
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
