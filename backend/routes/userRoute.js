const express = require('express');
const adminAuth = require('../middleware/adminAuth');
const authUser = require('../middleware/auth');
const {
    loginUser,
    registerUser,
    adminLogin,
    getAllUsers,
    deleteUser,
    updateUser,
    restrictUser,
    sendResetOtp,
    verifyAndResetPassword,
    getUserProfile,
    updateProfile,
    addAddress,    // IMPORTANT: Add this
    deleteAddress  // IMPORTANT: Add this
} = require('../controllers/userController');

const userRouter = express.Router();

// --- PUBLIC ROUTES ---
userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/admin', adminLogin);
userRouter.post('/forgot-password', sendResetOtp);
userRouter.post('/reset-password', verifyAndResetPassword);

// --- AUTH ROUTES (User & Admin both can access their own profile) ---
userRouter.get('/profile', authUser, getUserProfile);
userRouter.get('/current', authUser, getUserProfile);
userRouter.post('/update-profile', authUser, updateProfile);

// --- ADDRESS MANAGEMENT ROUTES (NEW) ---
userRouter.post('/add-address', authUser, addAddress);
userRouter.post('/delete-address', authUser, deleteAddress);

// --- ADMIN ONLY ROUTES (Strictly for Admins) ---
userRouter.get('/all', adminAuth, getAllUsers);
userRouter.post('/delete', adminAuth, deleteUser);
userRouter.post('/update', adminAuth, updateUser);
userRouter.post('/restrict', adminAuth, restrictUser);

module.exports = userRouter;