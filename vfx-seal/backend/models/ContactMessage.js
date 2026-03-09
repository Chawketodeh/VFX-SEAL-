const mongoose = require("mongoose");

const contactMessageSchema = new mongoose.Schema(
  {
    direction: {
      type: String,
      enum: ["INBOUND", "OUTBOUND"],
      default: "INBOUND",
    },
    senderType: {
      type: String,
      enum: ["STUDIO", "ADMIN"],
      default: "STUDIO",
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    senderName: {
      type: String,
      default: "",
    },
    senderEmail: {
      type: String,
      default: "",
    },
    senderCompany: {
      type: String,
      default: "",
    },
    studioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    studioName: {
      type: String,
      required: true,
    },
    studioEmail: {
      type: String,
      required: true,
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    recipientName: {
      type: String,
      default: "",
    },
    recipientEmail: {
      type: String,
      default: "",
    },
    recipientCompany: {
      type: String,
      default: "",
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    status: {
      type: String,
      enum: ["NEW", "REPLIED", "CLOSED"],
      default: "NEW",
    },
    adminReply: {
      type: String,
      default: "",
    },
    repliedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("ContactMessage", contactMessageSchema);
