const mongoose = require('mongoose');
const slugify = require('slugify');

const assessmentSectionSchema = new mongoose.Schema({
    sectionName: { type: String, required: true },
    score: { type: Number, required: true, min: 0, max: 10 },
    validatedSkills: [{ type: String }],
    unverifiedSkills: [{ type: String }],
    nonValidatedSkills: [{ type: String }],
}, { _id: false });

const vendorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Vendor name is required'],
        trim: true,
    },
    slug: {
        type: String,
        unique: true,
        index: true,
    },
    logo: {
        type: String,
        default: '',
    },
    country: {
        type: String,
        required: [true, 'Country is required'],
        trim: true,
    },
    size: {
        type: String,
        enum: ['Micro', 'Small', 'Medium', 'Large'],
        required: [true, 'Size is required'],
    },
    foundedYear: {
        type: Number,
    },
    website: {
        type: String,
        default: '',
    },
    demoReel: {
        type: String,
        default: '',
    },
    shortDescription: {
        type: String,
        default: '',
    },
    services: [{
        type: String,
        trim: true,
    }],
    badgeVOE: {
        type: String,
        enum: ['None', 'Bronze', 'Silver', 'Gold'],
        default: 'None',
    },
    globalScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 10,
    },
    assessment: [assessmentSectionSchema],
    pdfReport: {
        filePath: { type: String, default: '' },
        visibility: {
            type: String,
            enum: ['members', 'private'],
            default: 'private',
        },
    },
}, {
    timestamps: true,
});

// Auto-generate slug from name before saving
vendorSchema.pre('save', function (next) {
    if (this.isModified('name') || !this.slug) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
   
});

module.exports = mongoose.model('Vendor', vendorSchema);
