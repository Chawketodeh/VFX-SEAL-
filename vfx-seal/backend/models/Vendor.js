const mongoose = require("mongoose");
const slugify = require("slugify");

const assessmentSectionSchema = new mongoose.Schema(
  {
    sectionName: { type: String, required: true },
    score: { type: Number, required: true, min: 0, max: 10 },
    validatedSkills: [{ type: String }],
    unverifiedSkills: [{ type: String }],
    nonValidatedSkills: [{ type: String }],
  },
  { _id: false },
);

const vendorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Vendor name is required"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    logo: {
      type: String,
      default: "",
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
    },
    size: {
      type: String,
      enum: ["Micro", "Small", "Medium", "Large"],
      required: [true, "Size is required"],
    },
    foundedYear: {
      type: Number,
    },
    website: {
      type: String,
      default: "",
    },
    demoReel: {
      type: String,
      default: "",
    },
    shortDescription: {
      type: String,
      default: "",
    },
    services: [
      {
        type: String,
        trim: true,
      },
    ],
    badgeVOE: {
      type: String,
      enum: ["None", "Bronze", "Silver", "Gold"],
      default: "None",
    },
    globalScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    assessment: [assessmentSectionSchema],
    pdfReport: {
      filePath: { type: String, default: "" },
      visibility: {
        type: String,
        enum: ["members", "private"],
        default: "private",
      },
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for performance optimization
vendorSchema.index({ country: 1, size: 1, badgeVOE: 1 }); // Compound index for filters
vendorSchema.index({
  name: "text",
  shortDescription: "text",
  services: "text",
}); // Text search
vendorSchema.index({ badgeVOE: -1, globalScore: -1 }); // Sorting index
vendorSchema.index({ createdAt: -1 }); // Recent vendors

// Auto-generate slug from name before saving
vendorSchema.pre("save", function (next) {
  const shouldGenerateFromName =
    !this.slug || (this.isModified("name") && !this.isModified("slug"));
  if (shouldGenerateFromName) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model("Vendor", vendorSchema);
