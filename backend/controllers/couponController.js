const Coupon = require('../models/Coupon');

// 1. Create Coupon (Admin Only)
exports.createCoupon = async (req, res) => {
    try {
        const newCoupon = await Coupon.create(req.body);
        res.status(201).json({ success: true, data: newCoupon });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// 2. Get All Coupons (Admin Only)
exports.getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find({}).sort({ createdAt: -1 });
        res.json({ success: true, coupons });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Delete Coupon (Admin Only)
exports.deleteCoupon = async (req, res) => {
    try {
        await Coupon.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Coupon deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Update Coupon (Admin Only)
exports.updateCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedCoupon = await Coupon.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedCoupon) {
            return res.status(404).json({ success: false, message: "Coupon not found" });
        }
        res.json({ success: true, data: updatedCoupon, message: "Coupon updated successfully" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// 5. Validate Coupon (Used during Checkout)
exports.validateCoupon = async (req, res) => {
    const { code, orderAmount } = req.body;

    try {
        const coupon = await Coupon.findOne({ code, isActive: true });

        if (!coupon) return res.status(404).json({ message: "Invalid or Expired Coupon" });

        // Check Expiry
        if (new Date() > coupon.expiryDate) {
            return res.status(400).json({ message: "Coupon has expired" });
        }

        // Check Usage Limit
        if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({ message: "Coupon usage limit has been reached" });
        }

        // Check Min Order Amount
        if (orderAmount < coupon.minOrderAmount) {
            return res.status(400).json({
                message: `Minimum order of ₹${coupon.minOrderAmount} required for this coupon`
            });
        }

        // Calculate Discount
        let discount = 0;
        if (coupon.discountType === 'percentage') {
            discount = (orderAmount * coupon.discountValue) / 100;
        } else {
            discount = coupon.discountValue; // Flat discount
        }

        // Final Amount
        const finalAmount = orderAmount - discount;

        res.json({
            success: true,
            discountAmount: discount,
            finalAmount: finalAmount > 0 ? finalAmount : 0
        });

    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};