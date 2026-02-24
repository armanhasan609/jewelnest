const userModel = require("../models/userModel");
const validator = require("validator");
const nodemailer = require('nodemailer');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

// Super Admin Config - Centralized configuration
const SUPER_ADMIN_ID = process.env.SUPER_ADMIN_ID || "5f8d04b3fc13ae0000000000";
const SUPER_ADMIN_EMAIL = process.env.ADMIN_EMAIL || "superadmin@jewelnest.com";
const SUPER_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// --- HELPERS ---
const createToken = (id, email = null, role = 'user') => {
    const payload = { id, role };
    if (email) payload.email = email;
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const checkActionPermission = async (requesterId, targetUserId) => {
    try {
        // Super Admin can do anything
        if (requesterId === SUPER_ADMIN_ID || requesterId.toString() === SUPER_ADMIN_ID) {
            return { allowed: true };
        }

        const requester = await userModel.findById(requesterId);
        if (!requester) return { allowed: false, message: "Requester not found" };

        // If requester is Super Admin by email
        if (requester.email === SUPER_ADMIN_EMAIL) {
            return { allowed: true };
        }

        const targetUser = await userModel.findById(targetUserId);
        if (!targetUser) return { allowed: false, message: "Target user not found" };

        // Regular admin cannot modify other admins
        if (targetUser.role === 'admin' && requesterId.toString() !== targetUserId.toString()) {
            return { allowed: false, message: "Only Super Admin can modify other Admins" };
        }

        // Users can only modify themselves
        if (requester.role === 'user' && requesterId.toString() !== targetUserId.toString()) {
            return { allowed: false, message: "You can only modify your own account" };
        }

        return { allowed: true };
    } catch (error) {
        console.error("Permission check error:", error);
        return { allowed: false, message: "Permission check failed" };
    }
};

// --- CONTROLLERS ---

// 1. Login User - Fixed with proper error handling
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("📥 Login attempt:", email);

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password required" });
        }

        // 1. Super Admin Check (Using process.env correctly)
        const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD; // Plain text check if hardcoded in .env
        const S_ADMIN_ID = process.env.SUPER_ADMIN_ID || "5f8d04b3fc13ae0000000000";

        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            console.log("✅ Super Admin credentials matched");
            const token = createToken(S_ADMIN_ID, email, 'admin'); // Role 'admin' for compatibility

            return res.status(200).json({
                success: true,
                token,
                user: {
                    _id: S_ADMIN_ID,
                    email: ADMIN_EMAIL,
                    role: 'admin',
                    name: "Super Admin",
                    isSuperAdmin: true,
                    address: []
                }
            });
        }

        // 2. Regular User Check
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        // Restriction Check
        if (user.isBlocked) {
            return res.status(403).json({ success: false, message: "Account is blocked." });
        }

        // Password Verification
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        // Token creation for User
        const token = createToken(user._id, user.email, user.role || 'user');

        return res.status(200).json({
            success: true,
            token,
            user: {
                _id: user._id,
                email: user.email,
                role: user.role || 'user',
                name: user.name,
                phone: user.phoneNumber || "",
                address: user.address || [],
                isSuperAdmin: false
            }
        });

    } catch (error) {
        console.error("🔥 Controller Error:", error.message);
        return res.status(500).json({ success: false, message: "Server Error" });
    }
};
// 2. Register User
const registerUser = async (req, res) => {
    try {
        const { name, email, phoneNumber, password } = req.body;

        // Validate input
        if (!name || !email || !phoneNumber || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Check if user already exists
        const existingUser = await userModel.findOne({ $or: [{ email }] });
        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(409).json({ success: false, message: "User already exists with this email" });
            }
        }

        // Email validation
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }

        // Password strength validation
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long"
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new userModel({
            name,
            email,
            password: hashedPassword,
            phoneNumber,
            role: 'user',
            address: []
        });

        // Save user
        const user = await newUser.save();

        // Create token
        const token = createToken(user._id, user.email, 'user');

        // Send response
        res.status(201).json({
            success: true,
            message: "Account created successfully",
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phoneNumber,
                role: user.role,
                address: user.address,
                isSuperAdmin: false
            }
        });
    } catch (error) {
        console.error("Register Error:", error);

        // Handle duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            const message = field === 'email'
                ? "User with this email already exists"
                : `User with this ${field} already exists`;

            return res.status(409).json({
                success: false,
                message: message
            });
        }

        res.status(500).json({
            success: false,
            message: "Registration failed. Please try again."
        });
    }
};

// 3. Admin Login (Separate endpoint if needed)
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // Super Admin Check
        if (email === SUPER_ADMIN_EMAIL && password === SUPER_ADMIN_PASSWORD) {
            const token = createToken(SUPER_ADMIN_ID, email, 'super-admin');

            return res.status(200).json({
                success: true,
                message: "Super Admin login successful",
                token,
                user: {
                    _id: SUPER_ADMIN_ID,
                    email: SUPER_ADMIN_EMAIL,
                    role: 'super-admin',
                    name: "Super Admin",
                    isSuperAdmin: true,
                    address: []
                }
            });
        }

        // Regular Admin Check
        const user = await userModel.findOne({ email, role: 'admin' });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid admin credentials"
            });
        }

        // Check if admin account is blocked
        if (user.isBlocked) {
            return res.status(403).json({
                success: false,
                message: "Admin account is blocked"
            });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid admin credentials"
            });
        }

        // Create token
        const token = createToken(user._id, user.email, 'admin');

        return res.status(200).json({
            success: true,
            message: "Admin login successful",
            token,
            user: {
                _id: user._id,
                email: user.email,
                role: 'admin',
                name: user.name,
                isSuperAdmin: false,
                address: user.address || []
            }
        });
    } catch (error) {
        console.error("Admin Login Error:", error);
        res.status(500).json({
            success: false,
            message: "Admin login failed"
        });
    }
};

// 4. Get User Profile
const getUserProfile = async (req, res) => {
    try {
        const userId = req.userId || req.user?._id;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID missing"
            });
        }

        // Super Admin Profile
        if (userId === SUPER_ADMIN_ID || userId.toString() === SUPER_ADMIN_ID) {
            return res.status(200).json({
                success: true,
                user: {
                    _id: SUPER_ADMIN_ID,
                    email: SUPER_ADMIN_EMAIL,
                    role: 'super-admin',
                    name: "Super Admin",
                    isSuperAdmin: true,
                    address: []
                }
            });
        }

        // Regular User Profile
        const user = await userModel.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phoneNumber,
                role: user.role || 'user',
                address: user.address || [],
                isSuperAdmin: user.email === SUPER_ADMIN_EMAIL,
                isBlocked: user.isBlocked || false,
                restrictedUntil: user.restrictedUntil
            }
        });
    } catch (error) {
        console.error("Profile Error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching profile"
        });
    }
};

// 5. Update Profile (Self)
const updateProfile = async (req, res) => {
    try {
        const userId = req.userId || req.user?._id;
        const { name, phone, password } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID missing"
            });
        }

        // Super Admin cannot be updated through this endpoint
        if (userId === SUPER_ADMIN_ID || userId.toString() === SUPER_ADMIN_ID) {
            return res.status(403).json({
                success: false,
                message: "Super Admin profile cannot be modified"
            });
        }

        // Build update data
        const updateData = {};
        if (name && name.trim() !== '') updateData.name = name.trim();
        if (phone && phone.trim() !== '') updateData.phoneNumber = phone.trim();

        if (password) {
            if (password.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: "Password must be at least 6 characters"
                });
            }
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        // If no data to update
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No data provided for update"
            });
        }

        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phoneNumber,
                role: updatedUser.role,
                address: updatedUser.address || [],
                isSuperAdmin: updatedUser.email === SUPER_ADMIN_EMAIL
            }
        });
    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update profile"
        });
    }
};

// 6. Add Address
const addAddress = async (req, res) => {
    try {
        const userId = req.userId;
        const addressData = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID missing"
            });
        }

        // Super Admin cannot have address
        if (userId === SUPER_ADMIN_ID || userId.toString() === SUPER_ADMIN_ID) {
            return res.status(403).json({
                success: false,
                message: "Super Admin cannot have address"
            });
        }

        // Validate required fields
        const requiredFields = ['street', 'city', 'state', 'pincode', 'phone'];
        const missingFields = requiredFields.filter(field => !addressData[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Create new address object
        const newAddress = {
            _id: new mongoose.Types.ObjectId(),
            street: addressData.street.trim(),
            city: addressData.city.trim(),
            state: addressData.state.trim(),
            pincode: addressData.pincode.trim(),
            phone: addressData.phone.trim(),
            isDefault: addressData.isDefault || false,
            label: addressData.label || 'Home'
        };

        // If setting as default, update all other addresses to non-default
        if (newAddress.isDefault) {
            await userModel.updateOne(
                { _id: userId },
                { $set: { "address.$[].isDefault": false } }
            );
        }

        const user = await userModel.findByIdAndUpdate(
            userId,
            { $push: { address: newAddress } },
            { new: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Address added successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phoneNumber,
                role: user.role,
                address: user.address || [],
                isSuperAdmin: user.email === SUPER_ADMIN_EMAIL
            }
        });
    } catch (error) {
        console.error("Add Address Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to add address"
        });
    }
};

// 7. Delete Address
const deleteAddress = async (req, res) => {
    try {
        const userId = req.userId;
        const { addressId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID missing"
            });
        }

        if (!addressId) {
            return res.status(400).json({
                success: false,
                message: "Address ID is required"
            });
        }

        const user = await userModel.findByIdAndUpdate(
            userId,
            { $pull: { address: { _id: addressId } } },
            { new: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Address removed successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phoneNumber,
                role: user.role,
                address: user.address || [],
                isSuperAdmin: user.email === SUPER_ADMIN_EMAIL
            }
        });
    } catch (error) {
        console.error("Delete Address Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to remove address"
        });
    }
};

// 8. Set Default Address
const setDefaultAddress = async (req, res) => {
    try {
        const userId = req.userId;
        const { addressId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID missing"
            });
        }

        if (!addressId) {
            return res.status(400).json({
                success: false,
                message: "Address ID is required"
            });
        }

        // First, set all addresses to non-default
        await userModel.updateOne(
            { _id: userId },
            { $set: { "address.$[].isDefault": false } }
        );

        // Then set the selected address as default
        const user = await userModel.findOneAndUpdate(
            { _id: userId, "address._id": addressId },
            { $set: { "address.$.isDefault": true } },
            { new: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User or address not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Default address updated successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phoneNumber,
                role: user.role,
                address: user.address || [],
                isSuperAdmin: user.email === SUPER_ADMIN_EMAIL
            }
        });
    } catch (error) {
        console.error("Set Default Address Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to set default address"
        });
    }
};

// 9. Get All Users (Admin Only)
const getAllUsers = async (req, res) => {
    try {
        const requesterId = req.userId;

        // Check if requester is admin or super admin
        if (requesterId !== SUPER_ADMIN_ID && requesterId.toString() !== SUPER_ADMIN_ID) {
            const requester = await userModel.findById(requesterId);
            if (!requester || requester.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: "Access denied. Admin only."
                });
            }
        }

        const users = await userModel.find({})
            .select("-password")
            .sort({ createdAt: -1 });

        // Add Super Admin to the list if requester is Super Admin
        let allUsers = [...users];
        if (requesterId === SUPER_ADMIN_ID || requesterId.toString() === SUPER_ADMIN_ID) {
            allUsers.unshift({
                _id: SUPER_ADMIN_ID,
                email: SUPER_ADMIN_EMAIL,
                role: 'super-admin',
                name: "Super Admin",
                phoneNumber: "0000000000",
                address: [],
                isSuperAdmin: true,
                isBlocked: false,
                createdAt: new Date()
            });
        }

        console.log("📊 Total users found:", allUsers.length);
        res.status(200).json({
            success: true,
            count: allUsers.length,
            users: allUsers
        });
    } catch (error) {
        console.error("Get All Users Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch users"
        });
    }
};

// 10. Delete User
const deleteUser = async (req, res) => {
    try {
        const requesterId = req.userId;
        const { targetId } = req.body;

        if (!targetId) {
            return res.status(400).json({
                success: false,
                message: "Target user ID is required"
            });
        }

        // Prevent deleting Super Admin
        if (targetId === SUPER_ADMIN_ID || targetId.toString() === SUPER_ADMIN_ID) {
            return res.status(403).json({
                success: false,
                message: "Cannot delete Super Admin"
            });
        }

        const permission = await checkActionPermission(requesterId, targetId);
        if (!permission.allowed) {
            return res.status(403).json({
                success: false,
                message: permission.message
            });
        }

        const deletedUser = await userModel.findByIdAndDelete(targetId);
        if (!deletedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        console.error("Delete User Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete user"
        });
    }
};

// 11. Update User (Admin Only)
const updateUser = async (req, res) => {
    try {
        const requesterId = req.userId;
        const { targetId, name, role } = req.body;

        if (!targetId) {
            return res.status(400).json({
                success: false,
                message: "Target user ID is required"
            });
        }

        // Prevent updating Super Admin
        if (targetId === SUPER_ADMIN_ID || targetId.toString() === SUPER_ADMIN_ID) {
            return res.status(403).json({
                success: false,
                message: "Cannot modify Super Admin"
            });
        }

        const permission = await checkActionPermission(requesterId, targetId);
        if (!permission.allowed) {
            return res.status(403).json({
                success: false,
                message: permission.message
            });
        }

        // Build update data
        const updateData = {};
        if (name && name.trim() !== '') updateData.name = name.trim();
        if (role && ['user', 'admin'].includes(role)) updateData.role = role;

        // If no data to update
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No data provided for update"
            });
        }

        const updatedUser = await userModel.findByIdAndUpdate(
            targetId,
            updateData,
            { new: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            user: updatedUser
        });
    } catch (error) {
        console.error("Update User Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update user"
        });
    }
};

// 12. Restrict User
const restrictUser = async (req, res) => {
    try {
        const requesterId = req.userId;
        const { targetId, hours } = req.body;

        if (!targetId) {
            return res.status(400).json({
                success: false,
                message: "Target user ID is required"
            });
        }

        // Prevent restricting Super Admin
        if (targetId === SUPER_ADMIN_ID || targetId.toString() === SUPER_ADMIN_ID) {
            return res.status(403).json({
                success: false,
                message: "Cannot restrict Super Admin"
            });
        }

        const permission = await checkActionPermission(requesterId, targetId);
        if (!permission.allowed) {
            return res.status(403).json({
                success: false,
                message: permission.message
            });
        }

        // Determine restriction status
        let updateData = {};
        if (hours && hours > 0) {
            const restrictionHours = parseInt(hours);
            updateData = {
                isBlocked: true,
                restrictedUntil: new Date(Date.now() + restrictionHours * 60 * 60 * 1000)
            };
        } else {
            updateData = {
                isBlocked: false,
                restrictedUntil: null
            };
        }

        const updatedUser = await userModel.findByIdAndUpdate(
            targetId,
            updateData,
            { new: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const message = hours > 0
            ? `User restricted for ${hours} hours`
            : "User restrictions removed";

        res.status(200).json({
            success: true,
            message: message,
            user: updatedUser
        });
    } catch (error) {
        console.error("Restrict User Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update user restriction"
        });
    }
};

// 13. Send Reset OTP
const sendResetOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        // Check if user exists
        const user = await userModel.findOne({ email });
        if (!user) {
            // Don't reveal if user exists or not for security
            return res.status(200).json({
                success: true,
                message: "If an account exists with this email, OTP will be sent"
            });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP to user
        user.resetOtp = otp;
        user.otpExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
        await user.save();

        // Send email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'JewelNest - Password Reset OTP',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Password Reset Request</h2>
                    <p>Hello ${user.name},</p>
                    <p>You requested to reset your password. Use the OTP below:</p>
                    <div style="background-color: #f4f4f4; padding: 15px; text-align: center; margin: 20px 0;">
                        <h1 style="color: #d4af37; margin: 0;">${otp}</h1>
                    </div>
                    <p>This OTP is valid for 15 minutes.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #777; font-size: 12px;">JewelNest Team</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        console.log(`📧 OTP sent to ${email}: ${otp}`);

        res.status(200).json({
            success: true,
            message: "OTP sent successfully"
        });
    } catch (error) {
        console.error("Send OTP Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to send OTP. Please try again."
        });
    }
};

// 14. Verify & Reset Password
const verifyAndResetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        // Validate input
        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters"
            });
        }

        // Find user
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Verify OTP
        if (!user.resetOtp || user.resetOtp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }

        // Check if OTP is expired
        if (user.otpExpire < Date.now()) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired"
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        // Clear OTP fields
        user.resetOtp = undefined;
        user.otpExpire = undefined;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Password reset successfully"
        });
    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to reset password"
        });
    }
};

// 15. Get Current User (Alias for getUserProfile)
const getCurrentUser = getUserProfile;

module.exports = {
    loginUser,
    registerUser,
    adminLogin,
    getUserProfile,
    getCurrentUser,
    updateProfile,
    addAddress,
    deleteAddress,
    setDefaultAddress,
    getAllUsers,
    deleteUser,
    updateUser,
    restrictUser,
    sendResetOtp,
    verifyAndResetPassword
};