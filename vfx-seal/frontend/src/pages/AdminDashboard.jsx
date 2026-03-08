import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";

const BADGE_ICONS = { Gold: "🏆", Silver: "🥈", Bronze: "🥉", None: "—" };

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("studios");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userFilter, setUserFilter] = useState("");
  const [feedbackFilter, setFeedbackFilter] = useState("PENDING");
  const [messageFilter, setMessageFilter] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectNote, setRejectNote] = useState({});
  const [replyText, setReplyText] = useState({});

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes] = await Promise.all([api.get("/admin/stats")]);
      setStats(statsRes.data);

      if (activeTab === "studios") {
        const params = userFilter ? `?status=${userFilter}` : "";
        const { data } = await api.get(`/admin/users${params}`);
        setUsers(data.users);
      } else if (activeTab === "vendors") {
        const { data } = await api.get("/vendors");
        setVendors(data.vendors);
      } else if (activeTab === "feedbacks") {
        const { data } = await api.get(
          `/feedbacks/admin/pending?status=${feedbackFilter || "PENDING"}`,
        );
        setFeedbacks(data.feedbacks);
      } else if (activeTab === "messages") {
        const params = messageFilter ? `?status=${messageFilter}` : "";
        const { data } = await api.get(`/contact/admin/messages${params}`);
        setMessages(data.messages);
      }
    } catch (err) {
      console.error("Admin fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "studios") {
      const fetchUsers = async () => {
        const params = userFilter ? `?status=${userFilter}` : "";
        const { data } = await api.get(`/admin/users${params}`);
        setUsers(data.users);
      };
      fetchUsers();
    }
  }, [userFilter]);

  useEffect(() => {
    if (activeTab === "feedbacks") {
      const fetchFeedbacks = async () => {
        const { data } = await api.get(
          `/feedbacks/admin/pending?status=${feedbackFilter || "PENDING"}`,
        );
        setFeedbacks(data.feedbacks);
      };
      fetchFeedbacks();
    }
  }, [feedbackFilter]);

  useEffect(() => {
    if (activeTab === "messages") {
      const fetchMessages = async () => {
        const params = messageFilter ? `?status=${messageFilter}` : "";
        const { data } = await api.get(`/contact/admin/messages${params}`);
        setMessages(data.messages);
      };
      fetchMessages();
    }
  }, [messageFilter]);

  const handleUserAction = async (userId, action) => {
    setActionLoading(`${userId}-${action}`);
    try {
      await api.patch(`/admin/users/${userId}/${action}`);
      await fetchData();
    } catch (err) {
      alert(`Failed to ${action} user`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteVendor = async (vendorId) => {
    if (!window.confirm("Are you sure you want to delete this vendor?")) return;
    try {
      await api.delete(`/vendors/${vendorId}`);
      await fetchData();
    } catch (err) {
      alert("Failed to delete vendor");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this studio?")) return;
    setActionLoading(`${userId}-delete`);
    try {
      await api.delete(`/admin/users/${userId}/delete`);
      await fetchData();
    } catch (err) {
      alert("Failed to delete studio");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("Are you sure you want to delete this message?"))
      return;
    setActionLoading(`${messageId}-delete`);
    try {
      await api.delete(`/contact/admin/messages/${messageId}`);
      await fetchData();
    } catch (err) {
      alert("Failed to delete message");
    } finally {
      setActionLoading(null);
    }
  };

  const handleFeedbackAction = async (id, action) => {
    setActionLoading(`${id}-${action}`);
    try {
      let body = {};
      let endpoint = `/feedbacks/${id}/${action}`;
      let method = "PATCH";

      if (action === "reject") {
        body = { adminNote: rejectNote[id] || "" };
      } else if (action === "delete") {
        method = "DELETE";
        endpoint = `/feedbacks/${id}/delete`;
      }

      if (method === "DELETE") {
        await api.delete(endpoint);
      } else {
        await api.patch(endpoint, body);
      }

      await fetchData();
      setRejectNote((prev) => {
        const n = { ...prev };
        delete n[id];
        return n;
      });
    } catch (err) {
      alert(`Failed to ${action} feedback`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReply = async (id) => {
    const reply = replyText[id];
    if (!reply?.trim()) {
      alert("Please enter a reply");
      return;
    }
    setActionLoading(`${id}-reply`);
    try {
      await api.post(`/contact/admin/reply/${id}`, { reply });
      await fetchData();
      setReplyText((prev) => {
        const n = { ...prev };
        delete n[id];
        return n;
      });
    } catch (err) {
      alert("Failed to send reply");
    } finally {
      setActionLoading(null);
    }
  };

  const badgeClass = (badge) => (badge || "none").toLowerCase();
  const renderStars = (rating) => (
    <span className="stars stars-sm">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={`star ${s <= rating ? "filled" : ""}`}>
          ★
        </span>
      ))}
    </span>
  );

  return (
    <div className="page-wrapper">
      <div className="container">
        <h1 className="slide-up" style={{ marginBottom: "var(--space-lg)" }}>
          Admin Dashboard
        </h1>

        {/* Stats */}
        {stats && (
          <div className="admin-stats fade-in">
            <div className="stat-card">
              <div className="stat-card-value">{stats.totalStudios}</div>
              <div className="stat-card-label">Total Studios</div>
            </div>
            <div className="stat-card">
              <div
                className="stat-card-value"
                style={{ color: "var(--warning)" }}
              >
                {stats.pendingStudios}
              </div>
              <div className="stat-card-label">Pending Approval</div>
            </div>
            <div className="stat-card">
              <div
                className="stat-card-value"
                style={{ color: "var(--success)" }}
              >
                {stats.approvedStudios}
              </div>
              <div className="stat-card-label">Approved</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-value" style={{ color: "var(--info)" }}>
                {stats.totalVendors}
              </div>
              <div className="stat-card-label">Vendors</div>
            </div>
            <div className="stat-card">
              <div
                className="stat-card-value"
                style={{ color: "var(--accent)" }}
              >
                {stats.pendingFeedbacks}
              </div>
              <div className="stat-card-label">Pending Feedbacks</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-value" style={{ color: "#f97316" }}>
                {stats.newMessages}
              </div>
              <div className="stat-card-label">New Messages</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === "studios" ? "active" : ""}`}
            onClick={() => setActiveTab("studios")}
            id="tab-studios"
          >
            🏢 Studios
          </button>
          <button
            className={`admin-tab ${activeTab === "vendors" ? "active" : ""}`}
            onClick={() => setActiveTab("vendors")}
            id="tab-vendors"
          >
            🏗 Vendors
          </button>
          <button
            className={`admin-tab ${activeTab === "feedbacks" ? "active" : ""}`}
            onClick={() => setActiveTab("feedbacks")}
            id="tab-feedbacks"
          >
            ⭐ Feedbacks{" "}
            {stats?.pendingFeedbacks > 0 && (
              <span className="tab-badge">{stats.pendingFeedbacks}</span>
            )}
          </button>
          <button
            className={`admin-tab ${activeTab === "messages" ? "active" : ""}`}
            onClick={() => setActiveTab("messages")}
            id="tab-messages"
          >
            📩 Messages{" "}
            {stats?.newMessages > 0 && (
              <span className="tab-badge">{stats.newMessages}</span>
            )}
          </button>
        </div>

        {/* Studios Tab */}
        {activeTab === "studios" && (
          <div className="fade-in">
            <div
              style={{
                display: "flex",
                gap: "var(--space-sm)",
                marginBottom: "var(--space-md)",
                flexWrap: "wrap",
              }}
            >
              {["", "PENDING", "APPROVED", "REJECTED"].map((f) => (
                <button
                  key={f}
                  className={`btn btn-sm ${userFilter === f ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setUserFilter(f)}
                  id={`filter-${f || "all"}`}
                >
                  {f || "All"}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="loading">
                <div className="spinner" />
              </div>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Company</th>
                      <th>Email</th>
                      <th>Country</th>
                      <th>Status</th>
                      <th>Registered</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td
                          colSpan="7"
                          style={{
                            textAlign: "center",
                            padding: "40px",
                            color: "var(--text-muted)",
                          }}
                        >
                          No studios found
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user._id}>
                          <td
                            style={{
                              fontWeight: 600,
                              color: "var(--text-primary)",
                            }}
                          >
                            {user.name}
                          </td>
                          <td>{user.company}</td>
                          <td>{user.email}</td>
                          <td>{user.country}</td>
                          <td>
                            <span
                              className={`status-badge ${user.status.toLowerCase()}`}
                            >
                              {user.status}
                            </span>
                          </td>
                          <td>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td>
                            <div className="admin-actions">
                              {user.status === "PENDING" && (
                                <>
                                  <button
                                    className="btn btn-success btn-sm"
                                    onClick={() =>
                                      handleUserAction(user._id, "approve")
                                    }
                                    disabled={
                                      actionLoading === `${user._id}-approve`
                                    }
                                    id={`approve-${user._id}`}
                                  >
                                    {actionLoading === `${user._id}-approve`
                                      ? "..."
                                      : "✓ Approve"}
                                  </button>
                                  <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() =>
                                      handleUserAction(user._id, "reject")
                                    }
                                    disabled={
                                      actionLoading === `${user._id}-reject`
                                    }
                                    id={`reject-${user._id}`}
                                  >
                                    ✗ Reject
                                  </button>
                                </>
                              )}
                              {user.status === "APPROVED" && (
                                <button
                                  className="btn btn-warning btn-sm"
                                  onClick={() =>
                                    handleUserAction(user._id, "block")
                                  }
                                  disabled={
                                    actionLoading === `${user._id}-block`
                                  }
                                  id={`block-${user._id}`}
                                >
                                  🚫 Block
                                </button>
                              )}
                              {user.status === "REJECTED" && (
                                <button
                                  className="btn btn-success btn-sm"
                                  onClick={() =>
                                    handleUserAction(user._id, "approve")
                                  }
                                  disabled={
                                    actionLoading === `${user._id}-approve`
                                  }
                                  id={`approve-${user._id}`}
                                >
                                  ✓ Re-Approve
                                </button>
                              )}
                              {/* Always available delete button */}
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDeleteUser(user._id)}
                                disabled={
                                  actionLoading === `${user._id}-delete`
                                }
                                id={`delete-user-${user._id}`}
                              >
                                {actionLoading === `${user._id}-delete`
                                  ? "..."
                                  : "🗑"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Vendors Tab */}
        {activeTab === "vendors" && (
          <div className="fade-in">
            <div style={{ marginBottom: "var(--space-md)" }}>
              <button
                className="btn btn-primary"
                onClick={() => navigate("/admin/vendors/new")}
                id="add-vendor-btn"
              >
                + Add Vendor
              </button>
            </div>

            {loading ? (
              <div className="loading">
                <div className="spinner" />
              </div>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Country</th>
                      <th>Size</th>
                      <th>Badge</th>
                      <th>Score</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendors.length === 0 ? (
                      <tr>
                        <td
                          colSpan="6"
                          style={{
                            textAlign: "center",
                            padding: "40px",
                            color: "var(--text-muted)",
                          }}
                        >
                          No vendors yet
                        </td>
                      </tr>
                    ) : (
                      vendors.map((vendor) => (
                        <tr key={vendor._id}>
                          <td
                            style={{
                              fontWeight: 600,
                              color: "var(--text-primary)",
                            }}
                          >
                            {vendor.name}
                          </td>
                          <td>{vendor.country}</td>
                          <td>{vendor.size}</td>
                          <td>
                            <span
                              className={`voe-badge ${badgeClass(vendor.badgeVOE)}`}
                              style={{ fontSize: "0.7rem" }}
                            >
                              {BADGE_ICONS[vendor.badgeVOE]} {vendor.badgeVOE}
                            </span>
                          </td>
                          <td>{vendor.globalScore?.toFixed(1)}</td>
                          <td>
                            <div className="admin-actions">
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() =>
                                  navigate(`/admin/vendors/${vendor._id}/edit`)
                                }
                                id={`edit-${vendor._id}`}
                              >
                                ✏ Edit
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDeleteVendor(vendor._id)}
                                id={`delete-${vendor._id}`}
                              >
                                🗑
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Feedbacks Tab */}
        {activeTab === "feedbacks" && (
          <div className="fade-in">
            <div
              style={{
                display: "flex",
                gap: "var(--space-sm)",
                marginBottom: "var(--space-md)",
                flexWrap: "wrap",
              }}
            >
              {["PENDING", "APPROVED", "REJECTED", "ALL"].map((f) => (
                <button
                  key={f}
                  className={`btn btn-sm ${feedbackFilter === f ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setFeedbackFilter(f)}
                  id={`filter-fb-${f.toLowerCase()}`}
                >
                  {f}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="loading">
                <div className="spinner" />
              </div>
            ) : feedbacks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">⭐</div>
                <h3>No feedbacks found</h3>
              </div>
            ) : (
              <div className="admin-feedback-list">
                {feedbacks.map((fb) => (
                  <div
                    className={`admin-feedback-card ${fb.isFlagged ? "admin-feedback-flagged" : ""}`}
                    key={fb._id}
                  >
                    <div className="admin-feedback-header">
                      <div>
                        <div className="admin-feedback-studio">
                          {fb.studioName}
                        </div>
                        <div className="admin-feedback-vendor">
                          → {fb.vendorId?.name || "Unknown Vendor"}
                        </div>
                        <div className="admin-feedback-date">
                          {new Date(fb.createdAt).toLocaleDateString()}
                        </div>
                        {fb.isFlagged && (
                          <div className="admin-feedback-flag-info">
                            🚩 <strong>Flagged:</strong> {fb.flagReason}
                          </div>
                        )}
                      </div>
                      <div className="admin-feedback-right">
                        {renderStars(fb.rating)}
                        <span
                          className={`status-badge ${fb.status.toLowerCase()}`}
                        >
                          {fb.status}
                        </span>
                        {fb.isFlagged && (
                          <span className="status-badge flagged">FLAGGED</span>
                        )}
                      </div>
                    </div>
                    <p className="admin-feedback-message">{fb.message}</p>
                    {fb.adminNote && (
                      <div className="admin-feedback-note">
                        <strong>Admin note:</strong> {fb.adminNote}
                      </div>
                    )}
                    <div className="admin-feedback-actions">
                      {fb.status === "PENDING" && (
                        <>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() =>
                              handleFeedbackAction(fb._id, "approve")
                            }
                            disabled={actionLoading === `${fb._id}-approve`}
                          >
                            {actionLoading === `${fb._id}-approve`
                              ? "..."
                              : "✓ Approve"}
                          </button>
                          <div className="admin-feedback-reject-group">
                            <input
                              className="form-input"
                              placeholder="Admin note (optional)"
                              value={rejectNote[fb._id] || ""}
                              onChange={(e) =>
                                setRejectNote((prev) => ({
                                  ...prev,
                                  [fb._id]: e.target.value,
                                }))
                              }
                              style={{ fontSize: "0.8rem" }}
                            />
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() =>
                                handleFeedbackAction(fb._id, "reject")
                              }
                              disabled={actionLoading === `${fb._id}-reject`}
                            >
                              ✗ Reject
                            </button>
                          </div>
                        </>
                      )}
                      {fb.isFlagged && fb.moderationStatus !== "deleted" && (
                        <button
                          className="btn btn-warning btn-sm"
                          onClick={() => handleFeedbackAction(fb._id, "unflag")}
                          disabled={actionLoading === `${fb._id}-unflag`}
                        >
                          🚩 Unflag
                        </button>
                      )}
                      {/* Always available delete button */}
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleFeedbackAction(fb._id, "delete")}
                        disabled={actionLoading === `${fb._id}-delete`}
                        id={`delete-feedback-${fb._id}`}
                      >
                        {actionLoading === `${fb._id}-delete` ? "..." : "🗑"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === "messages" && (
          <div className="fade-in">
            <div
              style={{
                display: "flex",
                gap: "var(--space-sm)",
                marginBottom: "var(--space-md)",
                flexWrap: "wrap",
              }}
            >
              {["", "NEW", "REPLIED", "CLOSED"].map((f) => (
                <button
                  key={f}
                  className={`btn btn-sm ${messageFilter === f ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setMessageFilter(f)}
                  id={`filter-msg-${f || "all"}`}
                >
                  {f || "All"}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="loading">
                <div className="spinner" />
              </div>
            ) : messages.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📩</div>
                <h3>No messages found</h3>
              </div>
            ) : (
              <div className="admin-messages-list">
                {messages.map((msg) => (
                  <div className="admin-message-card" key={msg._id}>
                    <div className="admin-message-header">
                      <div>
                        <div className="admin-message-studio">
                          {msg.studioName}
                        </div>
                        <div className="admin-message-email">
                          {msg.studioEmail}
                        </div>
                        <div className="admin-message-date">
                          {new Date(msg.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <span
                        className={`status-badge ${msg.status.toLowerCase()}`}
                      >
                        {msg.status}
                      </span>
                    </div>
                    <div className="admin-message-subject">
                      📋 {msg.subject}
                    </div>
                    <p className="admin-message-body">{msg.message}</p>
                    {msg.adminReply && (
                      <div className="admin-message-reply">
                        <strong>Your reply:</strong>
                        <p>{msg.adminReply}</p>
                        <small>
                          Replied {new Date(msg.repliedAt).toLocaleString()}
                        </small>
                      </div>
                    )}
                    {msg.status === "NEW" && (
                      <div className="admin-message-reply-form">
                        <textarea
                          className="form-input form-textarea"
                          placeholder="Type your reply..."
                          rows="3"
                          value={replyText[msg._id] || ""}
                          onChange={(e) =>
                            setReplyText((prev) => ({
                              ...prev,
                              [msg._id]: e.target.value,
                            }))
                          }
                        />
                        <div className="admin-message-actions">
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleReply(msg._id)}
                            disabled={actionLoading === `${msg._id}-reply`}
                          >
                            {actionLoading === `${msg._id}-reply`
                              ? "Sending..."
                              : "📤 Send Reply"}
                          </button>
                        </div>
                      </div>
                    )}
                    {/* Always available delete button */}
                    <div
                      className="admin-message-actions"
                      style={{ marginTop: "var(--space-sm)" }}
                    >
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteMessage(msg._id)}
                        disabled={actionLoading === `${msg._id}-delete`}
                        id={`delete-message-${msg._id}`}
                      >
                        {actionLoading === `${msg._id}-delete`
                          ? "..."
                          : "🗑 Delete"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
