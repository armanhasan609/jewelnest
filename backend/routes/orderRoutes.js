const express = require('express');
const router = express.Router();

const {
    createOrder,
    userOrders,
    getAllOrders,
    getOrderDetails,

    updateOrderStatus,
    getAdminStats,
    createRazorpayOrder,
    verifyRazorpayPayment,
    sendOTP,
    cancelOrder,
    verifyDeliveryOTP,
    handleWebhook
} = require('../controllers/orderController');

const authUser = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// USER ROUTES
router.post('/place', authUser, createOrder);
router.post('/userorders', authUser, userOrders);
router.get('/details/:orderId', authUser, getOrderDetails);
router.post('/razorpay/create', authUser, createRazorpayOrder);
router.post('/razorpay/verify', authUser, verifyRazorpayPayment);
router.post('/cancel', authUser, cancelOrder);

// WEBHOOK
router.post('/webhook', handleWebhook);

// ADMIN ROUTES
router.get('/list', adminAuth, getAllOrders);
router.get('/stats', adminAuth, getAdminStats);
router.post('/send-otp', adminAuth, sendOTP);
router.post('/status', adminAuth, updateOrderStatus);

// PUBLIC ROUTES (for delivery person)
router.post('/verify-otp', verifyDeliveryOTP);

module.exports = router;