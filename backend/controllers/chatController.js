const chatModel = require('../models/chatModel');

// GET /api/chat/:userId — Get chat history for a user
const getChatHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        const chat = await chatModel.findOne({ userId }).populate('userId', 'name email');

        if (!chat) {
            return res.json({ success: true, messages: [], chat: null });
        }

        res.json({ success: true, messages: chat.messages, chat });
    } catch (error) {
        console.error('getChatHistory error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAllChats = async (req, res) => {
    try {
        const chats = await chatModel
            .find({ "messages.0": { $exists: true } }) // Only fetch chats with at least 1 message
            .populate('userId', 'name email')
            .sort({ lastMessageAt: -1 });

        // Format for admin list view
        const formatted = chats.map((chat) => {
            const lastMsg = chat.messages.length > 0
                ? chat.messages[chat.messages.length - 1]
                : null;

            return {
                _id: chat._id,
                userId: chat.userId?._id || chat.userId,
                userName: chat.userId?.name || 'Unknown User',
                userEmail: chat.userId?.email || '',
                lastMessage: lastMsg ? lastMsg.text : '',
                lastSender: lastMsg ? lastMsg.sender : '',
                lastMessageAt: chat.lastMessageAt,
                messageCount: chat.messages.length
            };
        });

        res.json({ success: true, chats: formatted });
    } catch (error) {
        console.error('getAllChats error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// DELETE /api/chat/:userId — Clear chat history for a user
const clearChat = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Find chat and completely delete it so it removes from admin list
        await chatModel.findOneAndDelete({ userId });

        res.json({ success: true, message: "Chat cleared successfully" });
    } catch (error) {
        console.error('clearChat error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getChatHistory, getAllChats, clearChat };
