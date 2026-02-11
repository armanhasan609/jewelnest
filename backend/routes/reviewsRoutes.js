const express = require('express');
const router = express.Router();

const { getProductReviews, createReview, toggleReviewVisibility } = require('../controllers/reviewsController');
const authUser = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

router.get('/product/:productId', getProductReviews);
router.post('/', authUser, createReview);
router.patch('/:reviewId/visibility', adminAuth, toggleReviewVisibility);

module.exports = router;