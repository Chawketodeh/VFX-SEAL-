import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../api/client";
import { FiInbox, FiMessageSquare, FiFileText } from "react-icons/fi";

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

export default function MyMessagesPage() {
  const location = useLocation();
  const [contactMessages, setContactMessages] = useState([]);
  const [auditRequests, setAuditRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [highlightedMessageId, setHighlightedMessageId] = useState("");
  const markedReadRef = useRef(new Set());

  const unreadStudioMessageCount = useMemo(
    () => contactMessages.filter((message) => message.unreadForStudio).length,
    [contactMessages],
  );

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const messageId = params.get("messageId");
    if (messageId) {
      setHighlightedMessageId(messageId);
    }
  }, [location.search]);

  useEffect(() => {
    const fetchInbox = async () => {
      setLoading(true);
      setError("");
      try {
        const [contactRes, auditRes] = await Promise.allSettled([
          api.get("/contact/my-messages?limit=50"),
          api.get("/audit-requests/my-requests?limit=50"),
        ]);

        if (contactRes.status === "fulfilled") {
          setContactMessages(contactRes.value.data?.messages || []);
        } else {
          console.error("[MyMessages] contact endpoint failed", {
            endpoint: "/contact/my-messages",
            status: contactRes.reason?.response?.status,
            message:
              contactRes.reason?.response?.data?.message ||
              contactRes.reason?.displayMessage ||
              contactRes.reason?.message,
            details: contactRes.reason?.response?.data,
          });
          setContactMessages([]);
        }

        if (auditRes.status === "fulfilled") {
          setAuditRequests(auditRes.value.data?.requests || []);
        } else {
          console.error("[MyMessages] audit endpoint failed", {
            endpoint: "/audit-requests/my-requests",
            status: auditRes.reason?.response?.status,
            message:
              auditRes.reason?.response?.data?.message ||
              auditRes.reason?.displayMessage ||
              auditRes.reason?.message,
            details: auditRes.reason?.response?.data,
          });
          setAuditRequests([]);
        }

        if (
          contactRes.status === "rejected" &&
          auditRes.status === "rejected"
        ) {
          setError(
            contactRes.reason?.response?.data?.message ||
              auditRes.reason?.response?.data?.message ||
              "Unable to load your messages right now. Please try again.",
          );
        }
      } catch (err) {
        console.error("[MyMessages] unexpected fetch error", err);
        setError(
          err.response?.data?.message ||
            err.displayMessage ||
            "Unable to load your messages right now. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInbox();
  }, []);

  useEffect(() => {
    if (!highlightedMessageId || contactMessages.length === 0) return;

    const element = document.getElementById(
      `user-message-${highlightedMessageId}`,
    );
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    const timer = setTimeout(() => setHighlightedMessageId(""), 3500);
    return () => clearTimeout(timer);
  }, [highlightedMessageId, contactMessages]);

  useEffect(() => {
    const unreadIds = contactMessages
      .filter((message) => message.unreadForStudio)
      .map((message) => message._id)
      .filter((id) => !markedReadRef.current.has(id));

    if (unreadIds.length === 0) return;

    unreadIds.forEach((id) => markedReadRef.current.add(id));

    setContactMessages((prev) =>
      prev.map((message) =>
        unreadIds.includes(message._id)
          ? {
              ...message,
              unreadForStudio: false,
              studioReadAt: new Date().toISOString(),
            }
          : message,
      ),
    );

    Promise.allSettled(
      unreadIds.map((id) => api.patch(`/contact/my-messages/${id}/read`)),
    ).then((results) => {
      results.forEach((result, index) => {
        if (result.status === "rejected") {
          const failedId = unreadIds[index];
          markedReadRef.current.delete(failedId);
          setContactMessages((prev) =>
            prev.map((message) =>
              message._id === failedId
                ? {
                    ...message,
                    unreadForStudio: true,
                    studioReadAt: null,
                  }
                : message,
            ),
          );
        }
      });
    });
  }, [contactMessages]);

  const handleMarkAllMessagesRead = async () => {
    if (unreadStudioMessageCount === 0) return;

    try {
      await api.patch("/contact/my-messages/read-all");

      setContactMessages((prev) =>
        prev.map((message) => ({
          ...message,
          unreadForStudio: false,
          studioReadAt: message.studioReadAt || new Date().toISOString(),
        })),
      );
    } catch (err) {
      console.error("Mark all studio messages read error:", err);
    }
  };

  const getStudioMessageBadge = (message) => {
    const defaultStatus = message?.status || "NEW";
    if (message?.senderType === "ADMIN" && defaultStatus === "NEW") {
      return message?.unreadForStudio
        ? { label: "NEW", className: "new" }
        : { label: "READ", className: "closed" };
    }

    return {
      label: defaultStatus,
      className: defaultStatus.toLowerCase(),
    };
  };

  const totalItems = useMemo(
    () => contactMessages.length + auditRequests.length,
    [contactMessages.length, auditRequests.length],
  );

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="messages-page-header slide-up">
          <span className="section-tag">Studio Inbox</span>
          <h1>
            My <span className="accent">Messages</span>
          </h1>
          <p>
            Review your requests, admin replies, and current statuses in one
            place.
          </p>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner" />
          </div>
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : (
          <div className="messages-page-layout fade-in">
            <div className="messages-summary-card">
              <div className="messages-summary-top">
                <FiInbox size={18} />
                <span>Total Entries</span>
              </div>
              <div className="messages-summary-count">{totalItems}</div>
              <div className="messages-summary-meta">
                Contact messages: {contactMessages.length}
              </div>
              <div className="messages-summary-meta">
                Audit requests: {auditRequests.length}
              </div>
            </div>

            <section className="messages-section">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "var(--space-sm)",
                  marginBottom: "var(--space-sm)",
                }}
              >
                <div className="messages-section-title" style={{ margin: 0 }}>
                  <FiMessageSquare size={16} /> Contact Messages
                </div>
                {unreadStudioMessageCount > 0 && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={handleMarkAllMessagesRead}
                    id="mark-all-studio-messages-read-btn"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              {contactMessages.length === 0 ? (
                <div className="messages-empty">No contact messages yet.</div>
              ) : (
                <div className="admin-messages-list">
                  {contactMessages.map((msg) =>
                    (() => {
                      const badge = getStudioMessageBadge(msg);
                      return (
                        <article
                          className={`admin-message-card ${highlightedMessageId === msg._id ? "admin-item-highlight" : ""}`}
                          key={msg._id}
                          id={`user-message-${msg._id}`}
                        >
                          <div className="admin-message-header">
                            <div>
                              <div className="admin-message-studio">
                                {msg.subject}
                              </div>
                              <div className="admin-message-email">
                                {msg.senderType === "ADMIN"
                                  ? `From Admin/VOE${msg.senderName ? ` • ${msg.senderName}` : ""}`
                                  : "Your message to VFX Seal"}
                              </div>
                              <div className="admin-message-date">
                                {msg.senderType === "ADMIN"
                                  ? "Received"
                                  : "Sent"}{" "}
                                on {formatDate(msg.createdAt)}
                              </div>
                            </div>
                            <span className={`status-badge ${badge.className}`}>
                              {badge.label}
                            </span>
                          </div>

                          <div className="admin-message-body">
                            {msg.message}
                          </div>

                          {msg.senderType === "ADMIN" ? (
                            <div className="admin-message-reply">
                              <strong>Admin message</strong>
                              <p>
                                This message was sent directly by admin/VOE.
                              </p>
                            </div>
                          ) : msg.adminReply ? (
                            <div className="admin-message-reply">
                              <strong>Admin reply</strong>
                              <p>{msg.adminReply}</p>
                              <small>
                                Replied on{" "}
                                {formatDate(msg.repliedAt || msg.updatedAt)}
                              </small>
                            </div>
                          ) : (
                            <div className="messages-pending-reply">
                              Waiting for admin reply.
                            </div>
                          )}
                        </article>
                      );
                    })(),
                  )}
                </div>
              )}
            </section>

            <section className="messages-section">
              <div className="messages-section-title">
                <FiFileText size={16} /> Audit / Verification Requests
              </div>

              {auditRequests.length === 0 ? (
                <div className="messages-empty">No audit requests yet.</div>
              ) : (
                <div className="admin-messages-list">
                  {auditRequests.map((request) => (
                    <article className="admin-message-card" key={request.id}>
                      <div className="admin-message-header">
                        <div>
                          <div className="admin-message-studio">
                            {request.vendorName ||
                              request.vendor?.name ||
                              "Vendor"}
                          </div>
                          <div className="admin-feedback-vendor">
                            {request.sectionName} • {request.itemName}
                          </div>
                          <div className="admin-message-date">
                            Requested on {formatDate(request.createdAt)}
                          </div>
                        </div>
                        <span
                          className={`status-badge ${(request.status || "pending").toLowerCase()}`}
                        >
                          {request.statusDisplay || request.status}
                        </span>
                      </div>

                      <div className="admin-message-body">
                        {request.message?.trim()
                          ? request.message
                          : "No additional message was provided for this request."}
                      </div>

                      {request.adminReply ? (
                        <div className="admin-message-reply">
                          <strong>Admin / VOE reply</strong>
                          <p>{request.adminReply}</p>
                          <small>
                            Updated on{" "}
                            {formatDate(
                              request.statusUpdatedAt || request.updatedAt,
                            )}
                          </small>
                        </div>
                      ) : (
                        <div className="messages-pending-reply">
                          No admin/VOE note yet.
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
