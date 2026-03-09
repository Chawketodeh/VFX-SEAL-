const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "CONTACT_REPLY",
        "FEEDBACK_APPROVED",
        "FEEDBACK_REJECTED",
        "FEEDBACK_REMOVED",
        "NEW_CONTACT",
        "NEW_FEEDBACK",
        "FLAGGED_FEEDBACK",
        "AUDIT_REQUEST_UPDATE",
        "VENDOR_VERIFICATION_UPDATE",
        "SYSTEM",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    link: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Notification", notificationSchema);
