// middleware/auth.js - ADD LOGGING
const jwt = require('jsonwebtoken');

const authUser = async (req, res, next) => {
    try {
        const token = req.headers.token;

        console.log("🔍 Token received:", token ? `${token.substring(0, 20)}...` : "No token");

        if (!token) {
            return res.status(401).json({ success: false, message: "Not Authorized Login Required" });
        }

        try {
            const token_decode = jwt.verify(token, process.env.JWT_SECRET);

            console.log("🔑 Token decoded:", token_decode);

            // Extract userId from token - handle different field names
            const userId = token_decode._id || token_decode.id || token_decode.userId || token_decode.user;

            if (!userId) {
                console.error("❌ No userId found in token:", token_decode);
                return res.status(401).json({ success: false, message: "Invalid token structure" });
            }

            // Set req.user properly
            req.user = {
                _id: userId,
                email: token_decode.email,
                name: token_decode.name || token_decode.firstName
            };

            console.log("✅ Auth successful - req.user._id:", req.user._id);

            next();
        } catch (error) {
            console.error("❌ Token verification failed:", error.message);
            return res.status(401).json({ success: false, message: "Token Expired or Invalid" });
        }
    } catch (error) {
        console.error("❌ Auth middleware error:", error.message);
        return res.status(401).json({ success: false, message: error.message });
    }
};

module.exports = authUser;