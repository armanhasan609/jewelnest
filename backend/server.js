const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require('socket.io');

// Models
const chatModel = require('./models/chatModel');

// Routes Import
const userRouter = require('./routes/userRoute');
const productRouter = require('./routes/productRoutes');
const orderRouter = require('./routes/orderRoutes');
const contactRouter = require('./routes/contactRoute');
const reviewsRouter = require('./routes/reviewsRoutes');
const subCategoryRouter = require('./routes/subCategoryRoutes');
const couponRouter = require('./routes/couponRoutes');
const chatRouter = require('./routes/chatRoutes');

// 1. Database Connect
connectDB();

// 2. AWS S3 Config (loaded via config/s3.js and middleware/upload.js)


const missingRazorpayEnv = ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'].filter((k) => !process.env[k]);
if (missingRazorpayEnv.length) {
    console.warn(`⚠️ Missing Razorpay env vars: ${missingRazorpayEnv.join(', ')}`);
}

const app = express();


const allowedOrigins = [process.env.FRONTEND_URL, 'http://72.62.228.234', 'http://localhost:5174'].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'token'],
}));

// Yeh lines 'userId' undefined wale error ko fix karengi
app.use(express.json({
    limit: '10mb',
    verify: (req, res, buf) => {
        req.rawBody = buf.toString();
    }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. API Endpoints
app.use('/api/user', userRouter);
app.use('/api/users', userRouter);
app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter);
app.use('/api/contact', contactRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/subcategories', subCategoryRouter);
app.use('/api/coupons', couponRouter);
app.use('/api/chat', chatRouter);

// 5. Health Check
app.get('/api/health', (req, res) => {
    res.json({ ok: true, message: 'Server is healthy' });
});

// Create HTTP server
const server = http.createServer(app);

// 6. Socket.IO Setup
const io = new Server(server, {
    cors: {
        origin: "*", // Testing ke liye easy rakha hai
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_chat', (userId) => {
        if (userId) {
            socket.join(userId);
            console.log(`User joined room: ${userId}`);
        }
    });

    socket.on('send_message', async (data) => {
        try {
            const { userId, sender, text } = data;
            if (!userId || !text) return;

            // Save to Database
            let chat = await chatModel.findOne({ userId });
            if (!chat) chat = new chatModel({ userId, messages: [] });

            const message = {
                sender,
                text,
                timestamp: new Date()
            };

            chat.messages.push(message);
            chat.lastMessageAt = Date.now();
            await chat.save();

            // Broadcast to the room
            io.to(userId).emit('receive_message', message);
        } catch (error) {
            console.error('Socket error:', error);
        }
    });

    socket.on('clear_chat', async (userId) => {
        if (!userId) return;
        try {
            // Completely delete from DB
            await chatModel.findOneAndDelete({ userId });
            
            // Broadcast to the room with userId payload so clients know which one was cleared
            // We also emit to ALL connected clients so the admin sees it everywhere
            io.emit('chat_cleared', userId);
        } catch (error) {
            console.error('Socket clear chat error:', error);
        }
    });

    socket.on('disconnect', () => console.log('User disconnected'));
});

// 7. Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: "Internal Server Error" });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});