const mongoose = require("mongoose");

const auditRequestSchema = new mongoose.Schema(
  {
    // Requester information
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Requester ID is required"],
    },
    requesterName: {
      type: String,
      required: [true, "Requester name is required"],
    },
    requesterCompany: {
      type: String,
      required: [true, "Requester company is required"],
    },
    requesterEmail: {
      type: String,
      required: [true, "Requester email is required"],
    },

    // Request details
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: [true, "Vendor ID is required"],
    },
    vendorName: {
      type: String,
      required: [true, "Vendor name is required"],
    },
    sectionName: {
      type: String,
      required: [true, "Section name is required"],
    },
    itemName: {
      type: String,
      required: [true, "Item name is required"],
    },
    itemType: {
      type: String,
      enum: ["unverified", "nonvalidated"],
      required: [true, "Item type is required"],
    },

    // Visibility and message
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    message: {
      type: String,
      maxlength: [500, "Message cannot exceed 500 characters"],
      trim: true,
      default: "",
    },

    // Request status
    status: {
      type: String,
      enum: ["pending", "accepted", "completed", "rejected"],
      default: "pending",
    },
    statusUpdatedAt: {
      type: Date,
    },
    statusUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Admin notes
    adminNotes: {
      type: String,
      maxlength: [1000, "Admin notes cannot exceed 1000 characters"],
      trim: true,
      default: "",
    },

    // Notification tracking
    emailSent: {
      type: Boolean,
      default: false,
    },
    emailSentAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for efficient querying
auditRequestSchema.index({ requesterId: 1, createdAt: -1 });
auditRequestSchema.index({ vendorId: 1, createdAt: -1 });
auditRequestSchema.index({ status: 1, createdAt: -1 });
auditRequestSchema.index(
  {
    requesterId: 1,
    vendorId: 1,
    sectionName: 1,
    itemName: 1,
  },
  {
    name: "duplicate_prevention_index",
  },
);

// Static method to check user's daily request quota
auditRequestSchema.statics.checkDailyQuota = async function (
  userId,
  maxPerDay = 5,
) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const count = await this.countDocuments({
    requesterId: userId,
    createdAt: { $gte: startOfDay },
  });

  return {
    used: count,
    remaining: Math.max(0, maxPerDay - count),
    canRequest: count < maxPerDay,
  };
};

// Static method to check for recent duplicate requests (prevent spam)
auditRequestSchema.statics.checkRecentDuplicate = async function (
  userId,
  vendorId,
  sectionName,
  itemName,
  hoursBack = 24,
) {
  const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

  const existingRequest = await this.findOne({
    requesterId: userId,
    vendorId: vendorId,
    sectionName: sectionName,
    itemName: itemName,
    createdAt: { $gte: cutoffTime },
  });

  return existingRequest !== null;
};

// Method to get human-readable status
auditRequestSchema.methods.getStatusDisplay = function () {
  const statusMap = {
    pending: "Pending Review",
    accepted: "Accepted - In Progress",
    completed: "Completed",
    rejected: "Declined",
  };
  return statusMap[this.status] || this.status;
};

module.exports = mongoose.model("AuditRequest", auditRequestSchema);
