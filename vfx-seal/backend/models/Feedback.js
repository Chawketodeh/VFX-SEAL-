const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    studioId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    studioName: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
    // Moderation fields
    isFlagged: {
      type: Boolean,
      default: false,
    },
    flagReason: {
      type: String,
      default: "",
      trim: true,
    },
    moderationStatus: {
      type: String,
      enum: ["visible", "flagged", "deleted"],
      default: "visible",
    },
    adminNote: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// Unique constraint: one feedback per studio per vendor
feedbackSchema.index({ vendorId: 1, studioId: 1 }, { unique: true });

module.exports = mongoose.model("Feedback", feedbackSchema);
