const express = require('express');
const Feedback = require('../models/Feedback');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { protect, requireApproved } = require('../middleware/auth');
const router = express.Router();

// POST /api/feedbacks — submit feedback (approved studio only)
router.post('/', protect, requireApproved, async (req, res) => {
    try {
        // Only studios can leave feedback
        if (req.user.role !== 'STUDIO') {
            return res.status(403).json({ message: 'Only studios can leave feedback' });
        }

        const { vendorId, rating, message } = req.body;

        if (!vendorId || !rating || !message) {
            return res.status(400).json({ message: 'Vendor ID, rating, and message are required' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        if (message.length > 2000) {
            return res.status(400).json({ message: 'Message must be under 2000 characters' });
        }

        // Check for existing feedback (one per studio per vendor)
        const existing = await Feedback.findOne({ vendorId, studioId: req.user._id });
        if (existing) {
            return res.status(400).json({ message: 'You have already submitted feedback for this vendor' });
        }

        const feedback = await Feedback.create({
            vendorId,
            studioId: req.user._id,
            studioName: `${req.user.name} (${req.user.company})`,
            rating,
            message,
            status: 'PENDING',
        });

        // Notify all admins
        const admins = await User.find({ role: 'ADMIN' });
        for (const admin of admins) {
            const notification = await Notification.create({
                userId: admin._id,
                type: 'NEW_FEEDBACK',
                title: 'New Feedback Submitted',
                message: `${req.user.name} from ${req.user.company} submitted a ${rating}-star feedback.`,
                relatedId: feedback._id,
            });

            // Emit socket event
            const io = req.app.get('io');
            if (io) {
                io.to(`user_${admin._id}`).emit('notification', notification);
            }
        }

        console.log(`📧 [EMAIL STUB] New feedback notification sent to admins`);

        res.status(201).json({ feedback });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'You have already submitted feedback for this vendor' });
        }
        console.error('Submit feedback error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/feedbacks/vendor/:vendorId — get approved + rejected feedbacks for a vendor
router.get('/vendor/:vendorId', protect, requireApproved, async (req, res) => {
    try {
        // Fetch APPROVED and REJECTED feedbacks (PENDING hidden from public)
        const feedbacks = await Feedback.find({
            vendorId: req.params.vendorId,
            status: { $in: ['APPROVED', 'REJECTED'] },
        }).sort({ createdAt: -1 });

        // Calculate average rating from APPROVED only
        const approvedFeedbacks = feedbacks.filter(f => f.status === 'APPROVED');
        const totalRatings = approvedFeedbacks.length;
        const avgRating = totalRatings > 0
            ? approvedFeedbacks.reduce((sum, f) => sum + f.rating, 0) / totalRatings
            : 0;

        // Check if current user already submitted
        const myFeedback = await Feedback.findOne({
            vendorId: req.params.vendorId,
            studioId: req.user._id,
        });

        res.json({
            feedbacks,
            avgRating: Math.round(avgRating * 10) / 10,
            totalRatings,
            myFeedback,
        });
    } catch (error) {
        console.error('Get feedbacks error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/feedbacks/vendor/:vendorId/summary — lightweight summary for vendor cards
router.get('/vendor/:vendorId/summary', protect, requireApproved, async (req, res) => {
    try {
        const feedbacks = await Feedback.find({
            vendorId: req.params.vendorId,
            status: 'APPROVED',
        }).select('rating');

        const totalRatings = feedbacks.length;
        const avgRating = totalRatings > 0
            ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalRatings
            : 0;

        res.json({
            avgRating: Math.round(avgRating * 10) / 10,
            totalRatings,
        });
    } catch (error) {
        console.error('Get feedback summary error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/feedbacks/summaries — bulk summaries for all vendors (for vendor listing)
router.get('/summaries', protect, requireApproved, async (req, res) => {
    try {
        const summaries = await Feedback.aggregate([
            { $match: { status: 'APPROVED' } },
            {
                $group: {
                    _id: '$vendorId',
                    avgRating: { $avg: '$rating' },
                    totalRatings: { $sum: 1 },
                },
            },
        ]);

        const summaryMap = {};
        summaries.forEach(s => {
            summaryMap[s._id.toString()] = {
                avgRating: Math.round(s.avgRating * 10) / 10,
                totalRatings: s.totalRatings,
            };
        });

        res.json({ summaries: summaryMap });
    } catch (error) {
        console.error('Get feedback summaries error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ADMIN: GET /api/feedbacks/admin/pending — all pending feedbacks
router.get('/admin/pending', protect, async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const { status = 'PENDING' } = req.query;
        const filter = status === 'ALL' ? {} : { status };

        const feedbacks = await Feedback.find(filter)
            .populate('vendorId', 'name slug')
            .sort({ createdAt: -1 });

        res.json({ feedbacks });
    } catch (error) {
        console.error('Admin feedbacks error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ADMIN: PATCH /api/feedbacks/:id/approve
router.patch('/:id/approve', protect, async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const feedback = await Feedback.findById(req.params.id);
        if (!feedback) return res.status(404).json({ message: 'Feedback not found' });

        feedback.status = 'APPROVED';
        await feedback.save();

        // Notify studio
        const notification = await Notification.create({
            userId: feedback.studioId,
            type: 'FEEDBACK_APPROVED',
            title: 'Feedback Approved',
            message: 'Your feedback has been approved and is now visible publicly.',
            relatedId: feedback._id,
        });

        const io = req.app.get('io');
        if (io) {
            io.to(`user_${feedback.studioId}`).emit('notification', notification);
        }

        console.log(`📧 [EMAIL STUB] Feedback approved notification sent to studio ${feedback.studioId}`);

        res.json({ message: 'Feedback approved', feedback });
    } catch (error) {
        console.error('Approve feedback error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ADMIN: PATCH /api/feedbacks/:id/reject
router.patch('/:id/reject', protect, async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const feedback = await Feedback.findById(req.params.id);
        if (!feedback) return res.status(404).json({ message: 'Feedback not found' });

        feedback.status = 'REJECTED';
        feedback.adminNote = req.body.adminNote || '';
        await feedback.save();

        // Notify studio
        const notification = await Notification.create({
            userId: feedback.studioId,
            type: 'FEEDBACK_REJECTED',
            title: 'Feedback Rejected',
            message: req.body.adminNote
                ? `Your feedback was rejected: "${req.body.adminNote}"`
                : 'Your feedback was rejected by the admin.',
            relatedId: feedback._id,
        });

        const io = req.app.get('io');
        if (io) {
            io.to(`user_${feedback.studioId}`).emit('notification', notification);
        }

        res.json({ message: 'Feedback rejected', feedback });
    } catch (error) {
        console.error('Reject feedback error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
