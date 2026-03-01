const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema({
    studioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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
        enum: ['NEW', 'REPLIED', 'CLOSED'],
        default: 'NEW',
    },
    adminReply: {
        type: String,
        default: '',
    },
    repliedAt: {
        type: Date,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
