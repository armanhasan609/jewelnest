const express = require('express');
const router = express.Router();
const { getChatHistory, getAllChats, clearChat } = require('../controllers/chatController');
const authUser = require('../middleware/auth');

// Admin: get all chats (must come before :userId param route)
router.get('/admin/all', authUser, getAllChats);

// User/Admin: get chat history for a specific user
router.get('/:userId', authUser, getChatHistory);

// User/Admin: clear chat history
router.delete('/:userId', authUser, clearChat);

module.exports = router;
