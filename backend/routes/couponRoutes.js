const express = require('express');
const router = express.Router();
const { createCoupon, validateCoupon, getAllCoupons, deleteCoupon, updateCoupon } = require('../controllers/couponController');
const adminAuth = require('../middleware/adminAuth'); // Assuming there is an adminAuth middleware

router.post('/create', createCoupon); // Admin route
router.get('/all', getAllCoupons); // Admin route
router.delete('/:id', deleteCoupon); // Admin route
router.put('/:id', updateCoupon); // Admin route
router.post('/validate', validateCoupon); // Checkout route

module.exports = router;