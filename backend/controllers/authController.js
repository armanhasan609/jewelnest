const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. Register Logic
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        let admin = await Admin.findOne({ email });
        if (admin) {
            return res.json({ success: false, message: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        admin = new Admin({
            name, // Consistent with single name system
            email,
            password: hashedPassword
        });

        await admin.save();

        res.json({
            success: true,
            message: "Registered successfully!"
        });

    } catch (error) {
        console.error("Register Error:", error.message);
        res.json({ success: false, message: error.message });
    }
};

// 2. Login Logic
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await Admin.findOne({ email });
        if (!admin) {
            // Error handling matching frontend expectations
            return res.json({ success: false, message: "Invalid Credentials" });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid Credentials" });
        }

        const token = jwt.sign(
            { id: admin._id, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Sabse bada fix yahan hai: 
        // Frontend 'user' key expect kar raha hai (aapke UserController ke hisab se)
        res.json({
            success: true,
            message: "Login successful",
            token,
            user: { // Yahan 'admin' ki jagah 'user' bhej rahe hain for frontend compatibility
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                role: 'admin'
            }
        });

    } catch (error) {
        console.error("Login Error:", error.message);
        res.json({ success: false, message: "Server Error" });
    }
};

// 3. Get Profile Logic
exports.getMe = async (req, res) => {
    try {
        // req.user.id auth middleware se aana chahiye
        const userId = req.user?.id || req.body.userId;

        const admin = await Admin.findById(userId).select('-password');
        if (!admin) return res.json({ success: false, message: "Not Found" });

        res.json({ success: true, user: admin });
    } catch (error) {
        res.json({ success: false, message: "Error fetching profile" });
    }
};