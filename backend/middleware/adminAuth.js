const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const adminAuth = async (req, res, next) => {
    try {
        // FIXED: Try multiple ways to get token (case-insensitive)
        const token = req.headers.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.json({ success: false, message: "No token, login again" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const SUPER_ADMIN_ID = process.env.SUPER_ADMIN_ID || "5f8d04b3fc13ae0000000000";

        // 1. Super Admin Bypass
        if (decoded.id === SUPER_ADMIN_ID) {
            req.userId = decoded.id; // Kaun request bhej raha hai
            return next();
        }

        // 2. Regular Admin Check
        const User = mongoose.models.user || mongoose.model("user");
        const user = await User.findById(decoded.id);

        if (user && user.role === 'admin') {
            if (user.isBlocked) {
                return res.json({ success: false, message: "Account is blocked" });
            }

            req.userId = user._id.toString(); // Request bhejnewale ki ID
            next();
        } else {
            return res.json({ success: false, message: "Access Denied: Admins only" });
        }
    } catch (error) {
        console.error("Auth Error:", error.message);
        return res.json({ success: false, message: "Invalid Session" });
    }
};

module.exports = adminAuth;