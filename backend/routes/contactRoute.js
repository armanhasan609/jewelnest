const express = require('express');
const router = express.Router();
const contactModel = require('../models/contactModel');
const {
    saveMessage,
    getMessages,
    deleteMessage,
    listInquiry,
    updateStatus,
    assignInquiry,
    addResponse,
    getInquiryStats,
    getMessageById
} = require('../controllers/contactController');
const adminAuth = require('../middleware/adminAuth');

// PUBLIC ROUTES (must come FIRST before /:id routes)
// Temporarily remove validation to debug
router.post('/send', (req, res, next) => {
    console.log('=== ROUTE HIT: /api/contact/send ===');
    console.log('Request body:', req.body);
    next();
}, saveMessage);

// Admin protected routes
router.get('/list', adminAuth, listInquiry);
router.get('/messages', adminAuth, getMessages);
router.get('/stats', adminAuth, getInquiryStats);

// Filter endpoints (before /:id routes)
router.get('/filter/unread', adminAuth, async (req, res) => {
    try {
        const inquiries = await contactModel.find({ status: 'unread' })
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });

        res.json({ success: true, count: inquiries.length, data: inquiries });
    } catch (error) {
        console.error('Filter unread error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/filter/urgent', adminAuth, async (req, res) => {
    try {
        const inquiries = await contactModel.find({ priority: 'urgent', isResolved: false })
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });

        res.json({ success: true, count: inquiries.length, data: inquiries });
    } catch (error) {
        console.error('Filter urgent error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/filter/category/:category', adminAuth, async (req, res) => {
    try {
        const inquiries = await contactModel.find({ category: req.params.category })
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });

        res.json({ success: true, count: inquiries.length, data: inquiries });
    } catch (error) {
        console.error('Filter category error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Single inquiry operations (/:id routes - MUST come LAST)
router.route('/:id')
    .get(adminAuth, async (req, res, next) => {
        console.log('GET /:id route hit for ID:', req.params.id);
        next();
    }, getMessageById)
    .put(adminAuth, updateStatus)
    .delete(adminAuth, deleteMessage);

// Special operations
router.post('/:id/assign', adminAuth, assignInquiry);
router.post('/:id/response', adminAuth, addResponse);
router.post('/:id/resolve', adminAuth, async (req, res) => {
    try {
        const inquiry = await contactModel.findById(req.params.id);

        if (!inquiry) {
            return res.status(404).json({ success: false, message: 'Inquiry not found' });
        }

        inquiry.isResolved = true;
        inquiry.resolutionDate = new Date();
        inquiry.status = 'archived';

        await inquiry.save();

        res.json({
            success: true,
            message: 'Inquiry marked as resolved',
            data: inquiry
        });
    } catch (error) {
        console.error('Resolve inquiry error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete endpoint
router.post('/delete', adminAuth, deleteMessage);

// Main GET endpoint
router.get('/', adminAuth, getMessages);

module.exports = router;