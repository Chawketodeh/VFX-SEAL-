const express = require('express');
const User = require('../models/User');
const { protect, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// All admin routes require authentication + admin role
router.use(protect, requireAdmin);

// GET /api/admin/users — list all studio users
router.get('/users', async (req, res) => {
    try {
        const { status, search } = req.query;
        const filter = { role: 'STUDIO' };

        if (status) filter.status = status;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } },
            ];
        }

        const users = await User.find(filter).sort({ createdAt: -1 });
        res.json({ users });
    } catch (error) {
        console.error('Admin users list error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// PATCH /api/admin/users/:id/approve
router.patch('/users/:id/approve', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.role === 'ADMIN') return res.status(400).json({ message: 'Cannot modify admin users' });

        user.status = 'APPROVED';
        await user.save();

        // Stub: Log welcome email
        console.log(`📧 [EMAIL STUB] Welcome email sent to: ${user.email}`);
        console.log(`   Subject: Your VFX Seal account has been approved!`);

        res.json({ message: 'User approved successfully', user });
    } catch (error) {
        console.error('Approve user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// PATCH /api/admin/users/:id/reject
router.patch('/users/:id/reject', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.role === 'ADMIN') return res.status(400).json({ message: 'Cannot modify admin users' });

        user.status = 'REJECTED';
        await user.save();

        console.log(`📧 [EMAIL STUB] Rejection email sent to: ${user.email}`);

        res.json({ message: 'User rejected', user });
    } catch (error) {
        console.error('Reject user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// PATCH /api/admin/users/:id/block
router.patch('/users/:id/block', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.role === 'ADMIN') return res.status(400).json({ message: 'Cannot modify admin users' });

        user.status = 'REJECTED';
        await user.save();

        console.log(`📧 [EMAIL STUB] Account blocked notification sent to: ${user.email}`);

        res.json({ message: 'User blocked', user });
    } catch (error) {
        console.error('Block user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/admin/stats — dashboard stats
router.get('/stats', async (req, res) => {
    try {
        const [totalStudios, pendingStudios, approvedStudios, rejectedStudios] = await Promise.all([
            User.countDocuments({ role: 'STUDIO' }),
            User.countDocuments({ role: 'STUDIO', status: 'PENDING' }),
            User.countDocuments({ role: 'STUDIO', status: 'APPROVED' }),
            User.countDocuments({ role: 'STUDIO', status: 'REJECTED' }),
        ]);

        const Vendor = require('../models/Vendor');
        const totalVendors = await Vendor.countDocuments();

        res.json({
            totalStudios,
            pendingStudios,
            approvedStudios,
            rejectedStudios,
            totalVendors,
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
