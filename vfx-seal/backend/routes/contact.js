const express = require("express");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const { protect, requireAdmin } = require("../middleware/auth");
const ContactMessage = require("../models/ContactMessage");
const Notification = require("../models/Notification");
const User = require("../models/User");
const router = express.Router();

// ── In-memory rate limiter (per IP, resets daily) ──
const rateLimitMap = new Map();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.start > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { start: now, count: 1 });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

// ── Nodemailer transporter (stub / dev) ──
// In production, replace with real SMTP credentials
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ethereal.email",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
});

// Sanitize input to prevent XSS
function sanitize(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

function isUnsetDate(value) {
  return !value;
}

function getAdminUnreadFilter() {
  return {
    $and: [
      { status: "NEW" },
      {
        $or: [
          { senderType: "STUDIO" },
          { senderType: { $exists: false } },
          { senderType: null },
        ],
      },
      {
        $or: [
          { direction: { $ne: "OUTBOUND" } },
          { direction: { $exists: false } },
          { direction: null },
        ],
      },
      {
        $or: [{ adminReadAt: null }, { adminReadAt: { $exists: false } }],
      },
    ],
  };
}

function isUnreadForAdmin(message) {
  const senderType = message?.senderType || "STUDIO";
  const direction = message?.direction || "INBOUND";
  const status = message?.status || "NEW";
  const isAdminInboxSide = senderType !== "ADMIN" && direction !== "OUTBOUND";
  return status === "NEW" && isAdminInboxSide && isUnsetDate(message.adminReadAt);
}

function isUnreadForStudio(message) {
  // Unread for studio = message from ADMIN where studioReadAt is not yet set
  const senderType = message?.senderType || "STUDIO";
  const isFromAdmin = senderType === "ADMIN";
  return isFromAdmin && isUnsetDate(message.studioReadAt);
}

// Optional auth helper for public contact form:
// if a valid JWT is provided, link the message to the studio account.
async function getOptionalUser(req) {
  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) return null;
    const token = authHeader.split(" ")[1];
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select(
      "_id name email role status company",
    );
    return user || null;
  } catch {
    return null;
  }
}

// ── PUBLIC: POST /api/contact ── Anyone can send a contact message ──
router.post("/", async (req, res) => {
  try {
    const ip = req.ip || req.connection?.remoteAddress || "unknown";
    if (!checkRateLimit(ip)) {
      return res.status(429).json({
        message:
          "You have reached the daily message limit. Please try again tomorrow.",
      });
    }

    const { firstName, email, subject, message } = req.body;

    // Validation
    if (!firstName || !email || !subject || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ message: "Please provide a valid email address" });
    }

    // Subject validation
    const validSubjects = ["Technical Services", "Info Services"];
    if (!validSubjects.includes(subject)) {
      return res.status(400).json({ message: "Please select a valid subject" });
    }

    if (message.length > 5000) {
      return res
        .status(400)
        .json({ message: "Message must be under 5000 characters" });
    }

    if (firstName.length > 100) {
      return res.status(400).json({ message: "Name is too long" });
    }

    // Sanitize
    const safeName = sanitize(firstName.trim());
    const safeEmail = sanitize(email.trim().toLowerCase());
    const safeSubject = sanitize(subject);
    const safeMessage = sanitize(message.trim());

    // If caller is authenticated studio user, attach studioId for requester inbox flow
    const optionalUser = await getOptionalUser(req);
    const linkedStudioId =
      optionalUser && optionalUser.role === "STUDIO" ? optionalUser._id : null;

    // Store in database
    const contactMessage = await ContactMessage.create({
      direction: "INBOUND",
      senderType: "STUDIO",
      senderId: linkedStudioId,
      senderName: optionalUser?.name || safeName,
      senderEmail: optionalUser?.email || safeEmail,
      senderCompany: optionalUser?.company || "",
      studioId: linkedStudioId,
      studioName: safeName,
      studioEmail: safeEmail,
      subject: safeSubject,
      message: safeMessage,
      adminReadAt: null,
      studioReadAt: new Date(),
    });

    // Attempt to send email via Nodemailer
    try {
      const mailOptions = {
        from: `"VFX Seal Contact" <noreply@vfx-seal.com>`,
        to: "info@vfx-seal.com",
        replyTo: safeEmail,
        subject: `[VFX Seal Contact] ${safeSubject} — from ${safeName}`,
        html: `
                    <h2>New Contact Message</h2>
                    <p><strong>Name:</strong> ${safeName}</p>
                    <p><strong>Email:</strong> ${safeEmail}</p>
                    <p><strong>Subject:</strong> ${safeSubject}</p>
                    <hr />
                    <p>${safeMessage.replace(/\n/g, "<br />")}</p>
                    <hr />
                    <p style="color: #888; font-size: 12px;">Sent from VFX Seal Contact Form</p>
                `,
      };

      if (process.env.SMTP_USER) {
        await transporter.sendMail(mailOptions);
        console.log(`📧 Email sent to info@vfx-seal.com from ${safeEmail}`);
      } else {
        console.log(
          `📧 [EMAIL STUB] Contact from ${safeEmail} — Subject: ${safeSubject}`,
        );
        console.log(`   Name: ${safeName}`);
        console.log(`   Message: ${safeMessage.substring(0, 100)}...`);
      }
    } catch (emailErr) {
      console.error("Email send error (non-blocking):", emailErr.message);
      // Don't fail the request if email fails
    }

    // Notify admins in-app
    try {
      const admins = await User.find({ role: "ADMIN" });
      for (const admin of admins) {
        const notification = await Notification.create({
          userId: admin._id,
          type: "NEW_CONTACT",
          title: "New Contact Message",
          message: `${safeName} (${safeEmail}): "${safeSubject}"`,
          relatedId: contactMessage._id,
          link: `/admin?tab=messages&messageId=${contactMessage._id}`,
        });
        const io = req.app.get("io");
        if (io) {
          io.to(`user_${admin._id}`).emit("notification", notification);
        }
      }
    } catch (notifErr) {
      console.error("Notification error (non-blocking):", notifErr.message);
    }

    res.status(201).json({
      message:
        "Your message has been sent successfully. Our team will contact you shortly.",
    });
  } catch (error) {
    console.error("Contact message error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// ── STUDIO: GET /api/contact/my-messages ──
// Returns the authenticated studio's own contact messages, including admin replies/status.
router.get("/my-messages", protect, async (req, res) => {
  try {
    const user = req.user;

    if (user.role !== "STUDIO") {
      return res
        .status(403)
        .json({ message: "Only studio users can view messages" });
    }

    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(
      50,
      Math.max(1, parseInt(req.query.limit || "20", 10)),
    );
    const skip = (page - 1) * limit;

    const ownershipFilter = {
      $or: [
        { studioId: user._id },
        { recipientId: user._id },
        { studioEmail: user.email },
        { recipientEmail: user.email },
      ],
    };

    const [messages, totalCount] = await Promise.all([
      ContactMessage.find(ownershipFilter)
        .populate("senderId", "name email company")
        .populate("recipientId", "name email company")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ContactMessage.countDocuments(ownershipFilter),
    ]);

    const messagesWithReadState = messages.map((message) => ({
      ...message,
      unreadForStudio: isUnreadForStudio(message),
    }));

    const unreadCount = messagesWithReadState.filter(
      (message) => message.unreadForStudio,
    ).length;

    const totalPages = Math.ceil(totalCount / limit) || 1;

    res.json({
      messages: messagesWithReadState,
      unreadCount,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Studio messages error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ── ADMIN: GET /api/contact/admin/messages ──
router.get("/admin/messages", protect, requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const messages = await ContactMessage.find(filter)
      .populate("senderId", "name email company")
      .populate("recipientId", "name email company")
      .sort({ createdAt: -1 })
      .lean();

    const messagesWithReadState = messages.map((message) => ({
      ...message,
      unreadForAdmin: isUnreadForAdmin(message),
    }));

    const unreadCount = await ContactMessage.countDocuments(
      getAdminUnreadFilter(),
    );

    res.json({ messages: messagesWithReadState, unreadCount });
  } catch (error) {
    console.error("Admin messages error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ── ADMIN: PATCH /api/contact/admin/messages/:id/read ──
router.patch(
  "/admin/messages/:id/read",
  protect,
  requireAdmin,
  async (req, res) => {
    try {
      const message = await ContactMessage.findById(req.params.id);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }

      if (isUnsetDate(message.adminReadAt)) {
        message.adminReadAt = new Date();
        await message.save();
      }

      const unreadCount = await ContactMessage.countDocuments(
        getAdminUnreadFilter(),
      );

      res.json({
        message: "Message marked as read",
        contactMessage: message,
        unreadCount,
      });
    } catch (error) {
      console.error("Admin mark read error:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// ── ADMIN: PATCH /api/contact/admin/messages/read-all ──
router.patch(
  "/admin/messages/read-all",
  protect,
  requireAdmin,
  async (_req, res) => {
    try {
      const now = new Date();
      const result = await ContactMessage.updateMany(
        getAdminUnreadFilter(),
        { $set: { adminReadAt: now } },
      );

      res.json({
        message: "All admin messages marked as read",
        modifiedCount: result.modifiedCount || 0,
        unreadCount: 0,
      });
    } catch (error) {
      console.error("Admin mark all read error:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// ── STUDIO: PATCH /api/contact/my-messages/:id/read ──
router.patch("/my-messages/:id/read", protect, async (req, res) => {
  try {
    if (req.user.role !== "STUDIO") {
      return res
        .status(403)
        .json({ message: "Only studio users can mark messages as read" });
    }

    const message = await ContactMessage.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    const ownsMessage =
      (message.studioId &&
        message.studioId.toString() === req.user._id.toString()) ||
      (message.recipientId &&
        message.recipientId.toString() === req.user._id.toString()) ||
      message.studioEmail === req.user.email ||
      message.recipientEmail === req.user.email;

    if (!ownsMessage) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (isUnsetDate(message.studioReadAt)) {
      message.studioReadAt = new Date();
      await message.save();
    }

    const unreadCount = await ContactMessage.countDocuments({
      $and: [
        {
          $or: [
            { studioId: req.user._id },
            { recipientId: req.user._id },
            { studioEmail: req.user.email },
            { recipientEmail: req.user.email },
          ],
        },
        {
          $or: [{ studioReadAt: null }, { studioReadAt: { $exists: false } }],
        },
      ],
    });

    res.json({
      message: "Message marked as read",
      contactMessage: message,
      unreadCount,
    });
  } catch (error) {
    console.error("Studio mark read error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ── STUDIO: PATCH /api/contact/my-messages/read-all ──
router.patch("/my-messages/read-all", protect, async (req, res) => {
  try {
    if (req.user.role !== "STUDIO") {
      return res
        .status(403)
        .json({ message: "Only studio users can mark messages as read" });
    }

    const now = new Date();
    const result = await ContactMessage.updateMany(
      {
        $and: [
          {
            $or: [
              { studioId: req.user._id },
              { recipientId: req.user._id },
              { studioEmail: req.user.email },
              { recipientEmail: req.user.email },
            ],
          },
          {
            $or: [{ studioReadAt: null }, { studioReadAt: { $exists: false } }],
          },
        ],
      },
      { $set: { studioReadAt: now } },
    );

    res.json({
      message: "All studio messages marked as read",
      modifiedCount: result.modifiedCount || 0,
      unreadCount: 0,
    });
  } catch (error) {
    console.error("Studio mark all read error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ── ADMIN: GET /api/contact/admin/recipients ──
router.get("/admin/recipients", protect, requireAdmin, async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    const query = {
      role: "STUDIO",
      status: "APPROVED",
    };

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { company: { $regex: q, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("name email company")
      .sort({ name: 1 })
      .limit(100);

    res.json({ users });
  } catch (error) {
    console.error("Admin recipients error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ── ADMIN: POST /api/contact/admin/send ──
router.post("/admin/send", protect, requireAdmin, async (req, res) => {
  try {
    const { recipientIds, subject, message } = req.body;

    if (!Array.isArray(recipientIds) || recipientIds.length === 0) {
      return res
        .status(400)
        .json({ message: "Please select at least one recipient" });
    }
    if (!subject?.trim() || !message?.trim()) {
      return res
        .status(400)
        .json({ message: "Subject and message are required" });
    }

    const recipients = await User.find({
      _id: { $in: recipientIds },
      role: "STUDIO",
      status: "APPROVED",
    }).select("_id name email company");

    if (recipients.length === 0) {
      return res.status(404).json({ message: "No valid recipients found" });
    }

    const safeSubject = sanitize(subject.trim());
    const safeMessage = sanitize(message.trim());

    const docs = recipients.map((recipient) => ({
      direction: "OUTBOUND",
      senderType: "ADMIN",
      senderId: req.user._id,
      senderName: req.user.name,
      senderEmail: req.user.email,
      senderCompany: req.user.company || "VOE Admin",
      studioId: recipient._id,
      studioName: recipient.name,
      studioEmail: recipient.email,
      recipientId: recipient._id,
      recipientName: recipient.name,
      recipientEmail: recipient.email,
      recipientCompany: recipient.company || "",
      subject: safeSubject,
      message: safeMessage,
      status: "NEW",
      adminReadAt: new Date(),
      studioReadAt: null,
    }));

    const createdMessages = await ContactMessage.insertMany(docs);

    for (const msg of createdMessages) {
      try {
        const notification = await Notification.create({
          userId: msg.studioId,
          type: "SYSTEM",
          title: "New Message from Admin",
          message: `${msg.subject}`,
          relatedId: msg._id,
          link: `/messages?messageId=${msg._id}`,
        });

        const io = req.app.get("io");
        if (io) {
          io.to(`user_${msg.studioId}`).emit("notification", notification);
        }
      } catch (notifErr) {
        console.error("Admin send notification error:", notifErr.message);
      }
    }

    res.status(201).json({
      message: `Message sent to ${createdMessages.length} recipient(s)`,
      count: createdMessages.length,
    });
  } catch (error) {
    console.error("Admin send message error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ── ADMIN: POST /api/contact/admin/reply/:id ──
router.post("/admin/reply/:id", protect, requireAdmin, async (req, res) => {
  try {
    const { reply } = req.body;
    if (!reply) return res.status(400).json({ message: "Reply is required" });

    const contactMessage = await ContactMessage.findById(req.params.id);
    if (!contactMessage)
      return res.status(404).json({ message: "Message not found" });

    contactMessage.adminReply = reply;
    contactMessage.status = "REPLIED";
    contactMessage.repliedAt = new Date();
    contactMessage.adminReadAt = new Date();
    contactMessage.studioReadAt = null;
    await contactMessage.save();

    // Send reply email
    try {
      if (process.env.SMTP_USER) {
        await transporter.sendMail({
          from: `"VFX Seal" <info@vfx-seal.com>`,
          to: contactMessage.studioEmail,
          subject: `Re: ${contactMessage.subject} — VFX Seal`,
          html: `
                        <h2>Reply from VFX Seal</h2>
                        <p>${sanitize(reply).replace(/\n/g, "<br />")}</p>
                        <hr />
                        <p style="color: #888; font-size: 12px;">
                            Original message: "${contactMessage.message.substring(0, 200)}"
                        </p>
                    `,
        });
      }
    } catch (emailErr) {
      console.error("Reply email error:", emailErr.message);
    }

    // Notify studio if they have an account
    if (contactMessage.studioId) {
      const notification = await Notification.create({
        userId: contactMessage.studioId,
        type: "CONTACT_REPLY",
        title: "Admin Reply",
        message: `You have a response to "${contactMessage.subject}"`,
        relatedId: contactMessage._id,
        link: `/messages?messageId=${contactMessage._id}`,
      });
      const io = req.app.get("io");
      if (io) {
        io.to(`user_${contactMessage.studioId}`).emit(
          "notification",
          notification,
        );
      }
    }

    res.json({ message: "Reply sent successfully", contactMessage });
  } catch (error) {
    console.error("Admin reply error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ─ ADMIN: DELETE /api/contact/admin/messages/:id ─
router.delete(
  "/admin/messages/:id",
  protect,
  requireAdmin,
  async (req, res) => {
    try {
      const message = await ContactMessage.findById(req.params.id);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }

      await ContactMessage.findByIdAndDelete(req.params.id);

      res.json({ message: "Message deleted successfully" });
    } catch (error) {
      console.error("Delete message error:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

module.exports = router;
