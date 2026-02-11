const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// 1. REGISTER Route (Naya user/admin banane ke liye)
// Endpoint: http://localhost:5000/api/auth/register
router.post('/register', authController.register);

// 2. LOGIN Route (Entry ke liye)
// Endpoint: http://localhost:5000/api/auth/login
router.post('/login', authController.login);

// 3. PROFILE Route (User data check karne ke liye)
// Isme baad mein 'protect' middleware lagega security ke liye
router.get('/me', authController.getMe);

module.exports = router;