import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "/api";

export default function ContactPage() {
  const { isLoggedIn } = useAuth();
  const [form, setForm] = useState({
    firstName: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !form.firstName.trim() ||
      !form.email.trim() ||
      !form.subject ||
      !form.message.trim()
    ) {
      setError("Please fill in all fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE}/contact`, form);
      setSuccess(true);
      setForm({ firstName: "", email: "", subject: "", message: "" });
    } catch (err) {
      const errorMessage =
        err.displayMessage ||
        err.response?.data?.message ||
        `Error ${err.response?.status}: ${err.response?.statusText}` ||
        "Failed to send message. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      {/* Public Navbar for non-logged-in users */}
      {!isLoggedIn && (
        <nav className="navbar" id="contact-navbar">
          <div className="navbar-inner">
            <Link to="/" className="navbar-brand">
              VFX <span className="accent">Seal</span>
            </Link>
            <div className="navbar-links">
              <Link to="/">Home</Link>
              <Link to="/contact" className="active">
                Contact
              </Link>
            </div>
            <div className="navbar-actions-public">
              <Link to="/register" className="btn btn-primary btn-sm">
                Join the Club
              </Link>
              <Link to="/login" className="btn btn-outline btn-sm">
                Login
              </Link>
            </div>
          </div>
        </nav>
      )}

      <div className="page-wrapper">
        <div className="container">
          {/* Page Header */}
          <div className="contact-header slide-up">
            <span className="section-tag">Get in Touch</span>
            <h1>
              Contact <span className="accent">Us</span>
            </h1>
            <p>
              Have a question or want to learn more about VFX Seal? We'd love to
              hear from you.
            </p>
          </div>

          <div className="contact-layout fade-in">
            {/* Left Column — Contact Info */}
            <div className="contact-info-column">
              <div className="contact-info-card">
                <div className="contact-info-icon">📍</div>
                <div>
                  <h3>Los Angeles Office</h3>
                  <p>1601 N Broadway, STE #3426</p>
                  <p>Los Angeles, CA 90012</p>
                  <a
                    href="https://maps.google.com/maps?q=1601+N+Broadway+Los+Angeles"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-map-link"
                  >
                    View on Map →
                  </a>
                </div>
              </div>

              <div className="contact-info-card">
                <div className="contact-info-icon">📍</div>
                <div>
                  <h3>Montreal Office</h3>
                  <p>4433 Chambord St. #301</p>
                  <p>Montreal, QC H2J 3M5</p>
                  <a
                    href="https://maps.google.com/maps?q=4433+Chambord+Montreal"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-map-link"
                  >
                    View on Map →
                  </a>
                </div>
              </div>

              <div className="contact-info-card">
                <div className="contact-info-icon">✉️</div>
                <div>
                  <h3>Email Us</h3>
                  <p>
                    <a href="mailto:info@vfx-seal.com">info@vfx-seal.com</a>
                  </p>
                  <p>
                    <a href="mailto:contact@vfx-seal.com">
                      contact@vfx-seal.com
                    </a>
                  </p>
                  <a
                    href="mailto:info@vfx-seal.com"
                    className="contact-map-link"
                  >
                    Send Email →
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column — Contact Form */}
            <div className="contact-form-card">
              <h2>Send us a message</h2>
              <p className="contact-form-subtitle">
                Fill out the form and our team will get back to you within 24
                hours.
              </p>

              {success ? (
                <div className="contact-success">
                  <div className="contact-success-icon">✅</div>
                  <h3>Message Sent Successfully!</h3>
                  <p>
                    Your message has been sent successfully. Our team will
                    contact you shortly.
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() => setSuccess(false)}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} id="contact-form">
                  {error && <div className="alert alert-error">⚠ {error}</div>}

                  <div className="form-group">
                    <label className="form-label" htmlFor="contact-firstName">
                      First Name
                    </label>
                    <input
                      id="contact-firstName"
                      name="firstName"
                      className="form-input"
                      type="text"
                      placeholder="John"
                      value={form.firstName}
                      onChange={handleChange}
                      maxLength={100}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="contact-email">
                      Email
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      className="form-input"
                      type="email"
                      placeholder="john@studio.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="contact-subject">
                      Subject
                    </label>
                    <select
                      id="contact-subject"
                      name="subject"
                      className="form-select"
                      value={form.subject}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select a subject</option>
                      <option value="Technical Services">
                        Technical Services
                      </option>
                      <option value="Info Services">Info Services</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="contact-message">
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      className="form-input form-textarea"
                      placeholder="How can we help you?"
                      rows="6"
                      value={form.message}
                      onChange={handleChange}
                      maxLength={5000}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg contact-submit-btn"
                    disabled={loading}
                    id="contact-submit"
                  >
                    {loading ? "Sending..." : "📤 Send Message"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
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
            <p className="footer-copy">
              © The Seal - <Link to="/terms">Terms & Conditions</Link> -{" "}
              <Link to="/privacy-policy">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
