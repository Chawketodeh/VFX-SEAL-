const express = require('express');
const nodemailer = require('nodemailer');
const { protect, requireAdmin } = require('../middleware/auth');
const ContactMessage = require('../models/ContactMessage');
const Notification = require('../models/Notification');
const User = require('../models/User');
const router = express.Router();

// ── In-memory rate limiter (per IP, resets daily) ──
const rateLimitMap = new Map();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

function checkRateLimit(ip) {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);
    if (!entry || now - entry.start > RATE_LIMIT_WINDOW_MS) {
        rateLimitMap.set(ip, { start: now, count: 1 });
        return true;
    }
    if (entry.count >= RATE_LIMIT_MAX) return false;
    entry.count++;
    return true;
}

// ── Nodemailer transporter (stub / dev) ──
// In production, replace with real SMTP credentials
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
    },
});

// Sanitize input to prevent XSS
function sanitize(str) {
    if (typeof str !== 'string') return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

// ── PUBLIC: POST /api/contact ── Anyone can send a contact message ──
router.post('/', async (req, res) => {
    try {
        const ip = req.ip || req.connection?.remoteAddress || 'unknown';
        if (!checkRateLimit(ip)) {
            return res.status(429).json({
                message: 'You have reached the daily message limit. Please try again tomorrow.',
            });
        }

        const { firstName, email, subject, message } = req.body;

        // Validation
        if (!firstName || !email || !subject || !message) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Please provide a valid email address' });
        }

        // Subject validation
        const validSubjects = ['Technical Services', 'Info Services'];
        if (!validSubjects.includes(subject)) {
            return res.status(400).json({ message: 'Please select a valid subject' });
        }

        if (message.length > 5000) {
            return res.status(400).json({ message: 'Message must be under 5000 characters' });
        }

        if (firstName.length > 100) {
            return res.status(400).json({ message: 'Name is too long' });
        }

        // Sanitize
        const safeName = sanitize(firstName.trim());
        const safeEmail = sanitize(email.trim().toLowerCase());
        const safeSubject = sanitize(subject);
        const safeMessage = sanitize(message.trim());

        // Store in database (optional but useful)
        const contactMessage = await ContactMessage.create({
            studioId: null,
            studioName: safeName,
            studioEmail: safeEmail,
            subject: safeSubject,
            message: safeMessage,
        });

        // Attempt to send email via Nodemailer
        try {
            const mailOptions = {
                from: `"VFX Seal Contact" <noreply@vfx-seal.com>`,
                to: 'info@vfx-seal.com',
                replyTo: safeEmail,
                subject: `[VFX Seal Contact] ${safeSubject} — from ${safeName}`,
                html: `
                    <h2>New Contact Message</h2>
                    <p><strong>Name:</strong> ${safeName}</p>
                    <p><strong>Email:</strong> ${safeEmail}</p>
                    <p><strong>Subject:</strong> ${safeSubject}</p>
                    <hr />
                    <p>${safeMessage.replace(/\n/g, '<br />')}</p>
                    <hr />
                    <p style="color: #888; font-size: 12px;">Sent from VFX Seal Contact Form</p>
                `,
            };

            if (process.env.SMTP_USER) {
                await transporter.sendMail(mailOptions);
                console.log(`📧 Email sent to info@vfx-seal.com from ${safeEmail}`);
            } else {
                console.log(`📧 [EMAIL STUB] Contact from ${safeEmail} — Subject: ${safeSubject}`);
                console.log(`   Name: ${safeName}`);
                console.log(`   Message: ${safeMessage.substring(0, 100)}...`);
            }
        } catch (emailErr) {
            console.error('Email send error (non-blocking):', emailErr.message);
            // Don't fail the request if email fails
        }

        // Notify admins in-app
        try {
            const admins = await User.find({ role: 'ADMIN' });
            for (const admin of admins) {
                const notification = await Notification.create({
                    userId: admin._id,
                    type: 'NEW_CONTACT',
                    title: 'New Contact Message',
                    message: `${safeName} (${safeEmail}): "${safeSubject}"`,
                    relatedId: contactMessage._id,
                });
                const io = req.app.get('io');
                if (io) {
                    io.to(`user_${admin._id}`).emit('notification', notification);
                }
            }
        } catch (notifErr) {
            console.error('Notification error (non-blocking):', notifErr.message);
        }

        res.status(201).json({
            message: 'Your message has been sent successfully. Our team will contact you shortly.',
        });
    } catch (error) {
        console.error('Contact message error:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
});

// ── ADMIN: GET /api/contact/admin/messages ──
router.get('/admin/messages', protect, requireAdmin, async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};
        const messages = await ContactMessage.find(filter).sort({ createdAt: -1 });
        res.json({ messages });
    } catch (error) {
        console.error('Admin messages error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ── ADMIN: POST /api/contact/admin/reply/:id ──
router.post('/admin/reply/:id', protect, requireAdmin, async (req, res) => {
    try {
        const { reply } = req.body;
        if (!reply) return res.status(400).json({ message: 'Reply is required' });

        const contactMessage = await ContactMessage.findById(req.params.id);
        if (!contactMessage) return res.status(404).json({ message: 'Message not found' });

        contactMessage.adminReply = reply;
        contactMessage.status = 'REPLIED';
        contactMessage.repliedAt = new Date();
        await contactMessage.save();

        // Send reply email
        try {
            if (process.env.SMTP_USER) {
                await transporter.sendMail({
                    from: `"VFX Seal" <info@vfx-seal.com>`,
                    to: contactMessage.studioEmail,
                    subject: `Re: ${contactMessage.subject} — VFX Seal`,
                    html: `
                        <h2>Reply from VFX Seal</h2>
                        <p>${sanitize(reply).replace(/\n/g, '<br />')}</p>
                        <hr />
                        <p style="color: #888; font-size: 12px;">
                            Original message: "${contactMessage.message.substring(0, 200)}"
                        </p>
                    `,
                });
            }
        } catch (emailErr) {
            console.error('Reply email error:', emailErr.message);
        }

        // Notify studio if they have an account
        if (contactMessage.studioId) {
            const notification = await Notification.create({
                userId: contactMessage.studioId,
                type: 'CONTACT_REPLY',
                title: 'Admin Reply',
                message: `You have a response to "${contactMessage.subject}"`,
                relatedId: contactMessage._id,
            });
            const io = req.app.get('io');
            if (io) {
                io.to(`user_${contactMessage.studioId}`).emit('notification', notification);
            }
        }

        res.json({ message: 'Reply sent successfully', contactMessage });
    } catch (error) {
        console.error('Admin reply error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
