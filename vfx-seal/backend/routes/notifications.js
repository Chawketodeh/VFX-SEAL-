const express = require('express');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');
const router = express.Router();

// GET /api/notifications — get current user's notifications
router.get('/', protect, async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50);

        const unreadCount = await Notification.countDocuments({
            userId: req.user._id,
            read: false,
        });

        res.json({ notifications, unreadCount });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// PATCH /api/notifications/read-all — mark all as read
router.patch('/read-all', protect, async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user._id, read: false },
            { read: true }
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Mark notifications read error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// PATCH /api/notifications/:id/read — mark single as read
router.patch('/:id/read', protect, async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { read: true },
            { new: true }
        );
        if (!notification) return res.status(404).json({ message: 'Notification not found' });
        res.json({ notification });
    } catch (error) {
        console.error('Mark notification read error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
