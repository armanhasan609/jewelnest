const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    customerName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    address: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    items: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product'
            },
            name: {
                type: String,
                required: true
            },
            sku: String,
            price: {
                type: Number,
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            images: {
                type: [String],
                required: true
            },
            image: {
                type: String,
                required: true
            },
            category: String,
            size: String,
            color: String,
            material: String,
            weight: String,
            // --- VARIANT DETAILS ---
            selectedColor: String,
            selectedSize: String,
            variantSku: String,
            variantImage: String
        }
    ],
    totalAmount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['COD', 'RAZORPAY', 'CARD', 'UPI', 'WALLET'],
        default: 'COD'
    },
    payment: {
        type: Boolean,
        default: false
    },
    paymentDetails: {
        provider: { type: String, default: 'razorpay' },
        orderId: { type: String },
        paymentId: { type: String },
        signature: { type: String },
        status: { type: String, default: 'created' },
        method: String,
        bank: String,
        wallet: String,
        vpa: String
    },
    status: {
        type: String,
        default: 'Order Placed',
        enum: [
            'Pending Payment',
            'Order Placed',
            'Processing',
            'Packing',
            'Shipped',
            'Out for delivery',
            'Delivered',
            'Cancelled',
            'Payment Failed'
        ]
    },
    date: {
        type: Date,
        default: Date.now
    },
    otp: {
        type: String,
        default: null
    },
    otpExpiry: {
        type: Date,
        default: null
    },
    otpGeneratedAt: {
        type: Date,
        default: null
    },
    otpVerified: {
        type: Boolean,
        default: false
    },
    otpVerifiedAt: {
        type: Date,
        default: null
    },
    // Shipping details
    trackingNumber: String,
    courierName: String,
    expectedDelivery: Date,
    deliveredAt: Date,
    // Admin notes
    notes: [{
        text: String,
        adminId: mongoose.Schema.Types.ObjectId,
        adminName: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    // Invoice details
    invoiceNumber: String,
    invoiceUrl: String,
    // Return/Refund
    returnRequested: {
        type: Boolean,
        default: false
    },
    returnReason: String,
    returnStatus: String,
    refundStatus: String
}, {
    timestamps: true
});

// Add indexes for better performance
OrderSchema.index({ userId: 1, date: -1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ email: 1 });
OrderSchema.index({ phoneNumber: 1 });
OrderSchema.index({ 'paymentDetails.orderId': 1 });

// Pre-validate hook to normalize images
OrderSchema.pre('validate', function (next) {
    // NOTE: Must use regular function (not arrow) to access 'this'
    try {
        if (this.items && Array.isArray(this.items)) {
            for (let i = 0; i < this.items.length; i++) {
                const item = this.items[i];

                // Initialize images array if missing
                if (!item.images) {
                    item.images = [];
                }

                // Ensure images is an array of strings
                if (!Array.isArray(item.images)) {
                    if (typeof item.images === 'string') {
                        item.images = [item.images];
                    } else if (item.image && typeof item.image === 'string') {
                        item.images = [item.image];
                    } else {
                        item.images = [];
                    }
                }

                // Fallback for primary image
                if (!item.image || item.image === '') {
                    if (item.images.length > 0 && typeof item.images[0] === 'string') {
                        item.image = item.images[0];
                    } else {
                        // If still no image, use a placeholder to pass validation
                        const placeholder = 'https://jewelnestimage.s3.ap-south-1.amazonaws.com/placeholder.jpg';
                        item.image = placeholder;
                        if (item.images.length === 0) {
                            item.images = [placeholder];
                        }
                    }
                }
            }
        }

        // Successfully processed - call next if it exists
        if (typeof next === 'function') {
            next();
        }
    } catch (error) {
        // If next exists, pass error, otherwise just log it
        if (typeof next === 'function') {
            next(error);
        } else {
            console.error("Order Validation Hook Error:", error);
        }
    }
});

// Virtual for formatted date
OrderSchema.virtual('formattedDate').get(function () {
    return this.date.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
});

// Virtual for total items count
OrderSchema.virtual('totalItems').get(function () {
    return this.items.reduce((total, item) => total + (item.quantity || 0), 0);
});

module.exports = mongoose.model('Order', OrderSchema);