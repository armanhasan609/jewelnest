const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    sku: { type: String, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },

    // --- PRICE SECTION ---
    price: { type: Number, required: true },         // Normal Selling Price (e.g., 1500)
    originalPrice: { type: Number, required: true }, // MRP (e.g., 2000)

    // --- SALE PRICE SECTION ---
    salePrice: { type: Number },                     // Sale ke time ka price (e.g., 1000)

    // --- STOCK SECTION ---
    stock: { type: Number, required: true, default: 0 },

    // --- SALE CONFIGURATION ---
    onSale: { type: Boolean, default: false },
    saleStartDate: { type: Date },
    saleEndDate: { type: Date },

    images: [
        {
            url: { type: String, required: true },
            publicId: { type: String, required: true }
        }
    ],
    cloudinaryPublicId: { type: String },
    // category: { type: String, required: true }, // Removed
    subCategory: { type: String, required: true },
    bestseller: { type: Boolean, default: false }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', ProductSchema);