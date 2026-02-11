const chatModel = require('../models/chatModel');

const sendMessage = async (req, res) => {
    try {
        const { userId, text, sender } = req.body; // sender: 'user' or 'admin'

        const chat = await chatModel.findOneAndUpdate(
            { userId: userId }, // Is user ka chat dhoondo
            {
                $push: { messages: { sender, text } }, // Array mein naya message daalo
                $set: { lastMessageAt: Date.now() }     // Time update karo
            },
            { upsert: true, new: true } // Agar chat nahi hai toh naya banao
        );

        res.json({ success: true, chat });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};