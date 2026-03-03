const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    type: {
        type: String,
        enum: ['CONTACT_REPLY', 'FEEDBACK_APPROVED', 'FEEDBACK_REJECTED', 'NEW_CONTACT', 'NEW_FEEDBACK'],
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
}, {
    timestamps: true,
});

module.exports = mongoose.model('Notification', notificationSchema);
