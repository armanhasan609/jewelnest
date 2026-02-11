const Review = require('../models/reviewsModel');
const Order = require('../models/Order');

const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const reviews = await Review.find({ productId, isVisible: true }).sort({ createdAt: -1 });
        return res.json({ success: true, reviews });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const createReview = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { productId, rating, text, userName } = req.body;

        console.log("📝 Review submission - userId:", userId, "userName:", userName);

        if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
        if (!productId || !rating || !text) {
            return res.status(400).json({ success: false, message: 'Missing fields' });
        }

        // Purchase check
        const hasPurchased = await Order.findOne({
            userId: userId.toString(),
            items: { $elemMatch: { productId } },
            $or: [{ paymentMethod: 'COD' }, { payment: true }]
        });

        if (!hasPurchased) {
            return res.status(403).json({ success: false, message: 'Purchase required to review' });
        }

        // Always create new review (no upsert)
        const review = await Review.create({
            productId,
            userId,
            userName: userName && userName.trim() ? userName : (req.user.name || 'User'),
            rating: Number(rating),
            text: text.trim()
        });

        console.log("✅ Review created:", review);
        return res.json({ success: true, review });
    } catch (error) {
        console.error("❌ Review creation error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

const toggleReviewVisibility = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { isVisible } = req.body;

        const updated = await Review.findByIdAndUpdate(
            reviewId,
            { isVisible: !!isVisible },
            { new: true }
        );

        if (!updated) return res.status(404).json({ success: false, message: 'Review not found' });
        return res.json({ success: true, review: updated });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getProductReviews, createReview, toggleReviewVisibility };
