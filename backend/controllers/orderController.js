const Order = require('../models/Order');
const Product = require('../models/Product');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// 1. PLACE ORDER
const createOrder = async (req, res) => {
    try {
        const { items, totalAmount, address, phoneNumber, customerName, email, paymentMethod } = req.body;
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Please login first" });
        }

        // Validate items
        const incomingItems = Array.isArray(items) ? items : [];
        if (incomingItems.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty!" });
        }

        // --- FIX: Sanitize items first to ensure consistent quantity across checks and DB ---
        const sanitizedItems = incomingItems.map(item => {
            const parsedQty = Number(item.quantity);
            return {
                ...item,
                quantity: (isNaN(parsedQty) || parsedQty < 1) ? 1 : parsedQty
            };
        });

        // 1. Validate all stock availability FIRST before decrementing
        // This prevents partial updates if item 3 fails but item 1 was updated
        for (const item of sanitizedItems) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ success: false, message: `Product not found: ${item.name}` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ success: false, message: `Insufficient stock for: ${item.name}` });
            }
        }

        // 2. Decrement Stock Atomic Update
        for (const item of sanitizedItems) {
            await Product.findByIdAndUpdate(
                item.productId,
                { $inc: { stock: -item.quantity } }
            );
        }

        // Normalize items with Simplified Image Logic
        const finalItems = sanitizedItems.map(item => {
            // 1. Determine primary image
            let finalImage = item.image;

            // If images array is provided and not empty, prioritize its first element
            if (Array.isArray(item.images) && item.images.length > 0) {
                finalImage = item.images[0];
            }

            // Handle if result is an object (e.g. Cloudinary resource)
            if (typeof finalImage === 'object' && finalImage !== null && finalImage.url) {
                finalImage = finalImage.url;
            }

            // 2. Default fallback if still empty
            // if (!finalImage) {
            //     finalImage = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';
            // }

            // 3. Ensure images is a valid array of strings
            let finalImagesArray = [];
            if (Array.isArray(item.images) && item.images.length > 0) {
                finalImagesArray = item.images.map(img =>
                    (typeof img === 'object' && img.url) ? img.url : img
                );
            } else {
                finalImagesArray = [finalImage];
            }

            // Safe Number conversion
            const safePrice = isNaN(Number(item.price)) ? 0 : Number(item.price);

            return {
                productId: item.productId,
                name: item.name,
                sku: item.sku || '',
                price: safePrice,
                quantity: item.quantity, // Use the sanitized quantity
                image: finalImage,       // Single string URL
                images: finalImagesArray, // Array format
                category: item.category || 'Uncategorized',
                size: item.size || '',
                color: item.color || '',
                material: item.material || '',
                weight: item.weight || ''
            };
        });

        const method = (paymentMethod || "COD").toUpperCase();

        // Safe Number conversion for total
        const safeTotal = isNaN(Number(totalAmount)) ? 0 : Number(totalAmount);

        const newOrder = new Order({
            userId,
            customerName,
            email,
            phoneNumber: phoneNumber || address?.phone || "N/A", // Ensure required field
            address,
            items: finalItems,
            totalAmount: safeTotal,
            paymentMethod: method,
            date: Date.now(),
            status: method === "RAZORPAY" ? "Pending Payment" : "Order Placed",
            payment: false
        });

        await newOrder.save();

        // Send order confirmation email
        await sendOrderConfirmationEmail(email, newOrder);

        res.status(201).json({
            success: true,
            message: "Order placed successfully!",
            orderId: newOrder._id,
            order: newOrder
        });

    } catch (error) {
        console.error("❌ Order Error:", error);
        res.status(500).json({ success: false, message: "Failed to process order. " + error.message });
    }
};

// 2. GET USER ORDERS
const userOrders = async (req, res) => {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({ success: false, message: "User ID not found" });
        }

        const orders = await Order.find({ userId }).sort({ date: -1 });

        // Format orders with proper image URLs
        const formattedOrders = orders.map(order => ({
            ...order.toObject(),
            items: order.items.map(item => ({
                ...item,
                images: ensureCloudinaryUrls(item.images || []),
                thumbnail: getThumbnailUrl(item.images?.[0] || item.image || ''),
                price: item.price || 0,
                total: (item.price || 0) * (item.quantity || 1)
            }))
        }));

        res.json({ success: true, orders: formattedOrders });
    } catch (error) {
        console.error("Error fetching user orders:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. GET ALL ORDERS (Admin)
const getAllOrders = async (req, res) => {
    try {
        const { status, page = 1, limit = 20, search = '' } = req.query;
        const skip = (page - 1) * limit;

        let filter = {};

        // Status filter
        if (status && status !== 'all') {
            filter.status = status;
        }

        // Search filter
        if (search) {
            filter.$or = [
                { customerName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phoneNumber: { $regex: search, $options: 'i' } },
                { 'items.name': { $regex: search, $options: 'i' } },
                { _id: { $regex: search, $options: 'i' } }
            ];
        }

        const orders = await Order.find(filter)
            .sort({ date: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalOrders = await Order.countDocuments(filter);

        // Format orders with enriched data
        const formattedOrders = await Promise.all(orders.map(async (order) => {
            const itemsWithImages = order.items.map(item => ({
                ...item.toObject(),
                images: ensureCloudinaryUrls(item.images || []),
                thumbnail: getThumbnailUrl(item.images?.[0] || item.image || ''),
                largeImage: getLargeImageUrl(item.images?.[0] || item.image || ''),
                itemTotal: (item.price || 0) * (item.quantity || 1)
            }));

            // Get product details if needed
            const enrichedItems = await Promise.all(itemsWithImages.map(async (item) => {
                try {
                    const product = await Product.findById(item.productId)
                        .select('description material weight dimensions sku');

                    return {
                        ...item,
                        description: product?.description || '',
                        material: product?.material || '',
                        weight: product?.weight || '',
                        dimensions: product?.dimensions || '',
                        productSku: product?.sku || item.sku,
                        itemTotal: (item.price || 0) * (item.quantity || 1)
                    };
                } catch (err) {
                    return item;
                }
            }));

            return {
                ...order.toObject(),
                items: enrichedItems,
                formattedDate: new Date(order.date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })
            };
        }));

        res.json({
            success: true,
            orders: formattedOrders,
            pagination: {
                total: totalOrders,
                page: parseInt(page),
                pages: Math.ceil(totalOrders / limit),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error("Admin Orders Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. GET SINGLE ORDER DETAILS
const getOrderDetails = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Enrich order items with product details and images
        const enrichedItems = await Promise.all(order.items.map(async (item) => {
            try {
                const product = await Product.findById(item.productId)
                    .select('description material weight dimensions sku');

                return {
                    ...item.toObject(),
                    images: ensureCloudinaryUrls(item.images || []),
                    thumbnail: getThumbnailUrl(item.images?.[0] || item.image || ''),
                    largeImages: ensureCloudinaryUrls(item.images || []).map(url => getLargeImageUrl(url)),
                    description: product?.description || '',
                    material: product?.material || '',
                    weight: product?.weight || '',
                    dimensions: product?.dimensions || '',
                    productSku: product?.sku || item.sku,
                    itemTotal: (item.price || 0) * (item.quantity || 1)
                };
            } catch (err) {
                return {
                    ...item.toObject(),
                    images: ensureCloudinaryUrls(item.images || []),
                    thumbnail: getThumbnailUrl(item.images?.[0] || item.image || ''),
                    itemTotal: (item.price || 0) * (item.quantity || 1)
                };
            }
        }));

        const formattedOrder = {
            ...order.toObject(),
            items: enrichedItems,
            formattedDate: new Date(order.date).toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            address: typeof order.address === 'string' ? order.address :
                `${order.address?.street || ''}, ${order.address?.city || ''}, ${order.address?.state || ''} - ${order.address?.pincode || ''}`
        };

        res.json({ success: true, order: formattedOrder });
    } catch (error) {
        console.error("Order Details Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Helper functions for Cloudinary URLs
const ensureCloudinaryUrls = (images) => {
    if (!Array.isArray(images)) {
        images = images ? [images] : [];
    }

    return images.map(img => {
        if (typeof img !== 'string') return '';

        // If already Cloudinary URL
        if (img.includes('cloudinary.com')) {
            return img;
        }

        // Convert local paths to Cloudinary
        if (img.startsWith('/uploads/')) {
            return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload${img}`;
        }

        return img;
    }).filter(img => img);
};

const getThumbnailUrl = (imageUrl, width = 150, height = 150) => {
    if (!imageUrl || !imageUrl.includes('cloudinary.com')) return imageUrl;

    return imageUrl.replace('/upload/', `/upload/w_${width},h_${height},c_fill/`);
};

const getLargeImageUrl = (imageUrl, width = 600, height = 600) => {
    if (!imageUrl || !imageUrl.includes('cloudinary.com')) return imageUrl;

    return imageUrl.replace('/upload/', `/upload/w_${width},h_${height},c_fill/`);
};

// Send order confirmation email
const sendOrderConfirmationEmail = async (email, order) => {
    try {
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const itemsHTML = order.items.map(item => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">
                    <img src="${getThumbnailUrl(item.images?.[0] || item.image, 80, 80)}" 
                         alt="${item.name}" 
                         style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">
                    <strong>${item.name}</strong><br>
                    <small>SKU: ${item.sku || 'N/A'}</small>
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
                    ${item.quantity}
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
                    ₹${item.price.toLocaleString()}
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
                    ₹${(item.price * item.quantity).toLocaleString()}
                </td>
            </tr>
        `).join('');

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: `Order Confirmation #${order._id.toString().slice(-6)} - JewelNest`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; background: #f9f9f9; padding: 30px;">
                    <div style="background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <div style="text-align: center; margin-bottom: 30px;">
                            <h1 style="color: #b8860b; margin: 0;">Order Confirmed! 🎉</h1>
                            <p style="color: #666; margin-top: 10px;">Thank you for shopping with JewelNest</p>
                        </div>
                        
                        <div style="background: #f8f5f0; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                            <h3 style="color: #b8860b; margin-top: 0;">Order Details</h3>
                            <p><strong>Order ID:</strong> ${order._id}</p>
                            <p><strong>Date:</strong> ${new Date(order.date).toLocaleDateString()}</p>
                            <p><strong>Total Amount:</strong> <span style="font-size: 24px; font-weight: bold; color: #b8860b;">₹${order.totalAmount.toLocaleString()}</span></p>
                        </div>
                        
                        <h3 style="color: #b8860b;">Order Items</h3>
                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                            <thead>
                                <tr style="background: #f8f5f0;">
                                    <th style="padding: 10px; text-align: left;">Image</th>
                                    <th style="padding: 10px; text-align: left;">Product</th>
                                    <th style="padding: 10px; text-align: center;">Qty</th>
                                    <th style="padding: 10px; text-align: right;">Price</th>
                                    <th style="padding: 10px; text-align: right;">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHTML}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="4" style="padding: 10px; text-align: right; font-weight: bold;">Total:</td>
                                    <td style="padding: 10px; text-align: right; font-weight: bold; font-size: 18px;">
                                        ₹${order.totalAmount.toLocaleString()}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                        
                        <div style="background: #f8f5f0; padding: 20px; border-radius: 8px;">
                            <h3 style="color: #b8860b; margin-top: 0;">Shipping Address</h3>
                            <p>${order.customerName}<br>
                            ${order.phoneNumber}<br>
                            ${typeof order.address === 'string' ? order.address :
                    `${order.address?.street || ''}, ${order.address?.city || ''}, ${order.address?.state || ''} - ${order.address?.pincode || ''}`}</p>
                        </div>
                        
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #eee; text-align: center;">
                            <p style="color: #999; font-size: 14px;">
                                Track your order in your account or contact us at support@jewelnest.com
                            </p>
                        </div>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Order confirmation email sent to ${email}`);
    } catch (error) {
        console.error("Email send error:", error);
    }
};

// 5. UPDATE ORDER STATUS (Admin)
const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;

        if (!orderId || !status) {
            return res.status(400).json({ success: false, message: 'Order ID and status required' });
        }

        const order = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.json({ success: true, message: 'Status updated successfully', order });
    } catch (error) {
        console.error("Update Status Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 6. GET ADMIN STATS
const getAdminStats = async (req, res) => {
    try {
        // Use Aggregation for performance instead of fetching all docs
        const stats = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalSales: { $sum: "$totalAmount" }
                }
            }
        ]);

        const categoryStats = await Order.aggregate([
            { $unwind: "$items" },
            {
                $group: {
                    _id: { $ifNull: ["$items.category", "General"] },
                    revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
                    sales: { $sum: "$items.quantity" }
                }
            },
            {
                $project: {
                    _id: 0,
                    category: "$_id",
                    revenue: 1,
                    sales: 1
                }
            }
        ]);

        const result = stats[0] || { totalOrders: 0, totalSales: 0 };

        res.status(200).json({
            success: true,
            stats: {
                totalOrders: result.totalOrders,
                totalSales: result.totalSales,
                topCategories: categoryStats
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 7. CREATE RAZORPAY ORDER
const createRazorpayOrder = async (req, res) => {
    try {
        const { amount, orderId } = req.body;

        if (!amount || Number(amount) <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid amount' });
        }

        const options = {
            amount: Math.round(Number(amount) * 100),
            currency: 'INR',
            receipt: orderId ? `order_${orderId}` : `order_${Date.now()}`
        };

        const rpOrder = await razorpay.orders.create(options);

        return res.status(200).json({
            success: true,
            keyId: process.env.RAZORPAY_KEY_ID,
            order: rpOrder
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 8. VERIFY RAZORPAY PAYMENT
const verifyRazorpayPayment = async (req, res) => {
    try {
        const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const body = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');

        const isValid = expectedSignature === razorpay_signature;

        if (orderId) {
            await Order.findByIdAndUpdate(orderId, {
                payment: isValid,
                status: isValid ? 'Order Placed' : 'Payment Failed',
                paymentDetails: {
                    orderId: razorpay_order_id,
                    paymentId: razorpay_payment_id,
                    signature: razorpay_signature,
                    status: isValid ? 'paid' : 'failed'
                }
            });
        }

        if (!isValid) {
            return res.status(400).json({ success: false, message: 'Invalid signature' });
        }

        return res.status(200).json({ success: true, message: 'Payment verified' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 9. SEND OTP
const sendOTP = async (req, res) => {
    try {
        const { orderId, email } = req.body;

        if (!orderId || !email) {
            return res.status(400).json({ success: false, message: "Order ID and email required" });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP to order (NO expiry time - valid until order is delivered or cancelled)
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            {
                otp,
                otpExpiry: null,
                otpGeneratedAt: new Date(),
                otpVerified: false
            },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Send OTP via Email
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your Delivery OTP - JewelNest',
            html: `
                <div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #b8860b;">Delivery OTP</h2>
                    <p>Your order is out for delivery!</p>
                    <p>Share this OTP with the delivery partner upon arrival.</p>
                    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                        <h1 style="color: #b8860b; font-size: 32px; letter-spacing: 5px; margin: 0;">${otp}</h1>
                        <p style="color: #6b7280; margin: 10px 0 0 0;">Valid until delivery</p>
                    </div>
                    <p style="color: #6b7280; font-size: 14px;">Order ID: ${orderId}</p>
                    <p style="color: #9ca3af; font-size: 12px;">JewelNest - Premium Jewelry Store</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        res.json({ success: true, message: 'OTP sent to email successfully', otp });
    } catch (error) {
        console.error("OTP Send Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Add new function to verify OTP
const verifyDeliveryOTP = async (req, res) => {
    try {
        const { orderId, otp, confirmDelivery } = req.body;

        if (!orderId || !otp) {
            return res.status(400).json({ success: false, message: "Order ID and OTP required" });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Check if OTP matches - Convert both to string to be safe against schema types (Number vs String)
        if (String(order.otp).trim() !== String(otp).trim()) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        // ONLY update status if confirmDelivery flag is explicitly passed (e.g., clicking "Mark as Delivered")
        if (confirmDelivery) {
            const updates = {
                otpVerified: true,
                otpVerifiedAt: new Date(),
                status: 'Delivered', // Force status update
                deliveredAt: new Date()
            };

            // If COD, mark as paid - Handle case insensitivity
            if (order.paymentMethod && order.paymentMethod.toUpperCase() === 'COD') {
                updates.payment = true;
                // Merge existing payment details with new info
                const currentDetails = order.paymentDetails || {};
                updates.paymentDetails = {
                    ...currentDetails,
                    method: 'COD',
                    status: 'paid',
                    paymentId: `COD_${Date.now()}`
                };
            }

            // Use atomic update to ensure DB reflects changes immediately
            const updatedOrder = await Order.findByIdAndUpdate(
                orderId,
                { $set: updates },
                { new: true, runValidators: false } // runValidators false helps avoid strict schema checks blocking update
            );

            return res.json({
                success: true,
                message: 'OTP verified & Order Delivered',
                order: updatedOrder
            });
        }

        // DEFAULT: Just verify (Login mode) - Do NOT update database status
        res.json({
            success: true,
            message: 'OTP verified successfully',
            order: order
        });

    } catch (error) {
        console.error("OTP Verify Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 10. CANCEL ORDER
const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({ success: false, message: 'Missing orderId' });
        }

        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        if (['Delivered', 'Cancelled'].includes(order.status)) {
            return res.status(400).json({ success: false, message: `Order already ${order.status}` });
        }

        // Restore stock
        for (const item of order.items || []) {
            if (item.productId && item.quantity) {
                await Product.findByIdAndUpdate(
                    item.productId,
                    { $inc: { stock: item.quantity } }
                );
            }
        }

        order.status = 'Cancelled';
        await order.save();

        return res.json({ success: true, message: 'Order cancelled and stock restored' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createOrder,
    userOrders,
    getAllOrders,
    getOrderDetails,
    updateOrderStatus,
    getAdminStats,
    createRazorpayOrder,
    verifyRazorpayPayment,
    sendOTP,
    verifyDeliveryOTP,
    cancelOrder
};