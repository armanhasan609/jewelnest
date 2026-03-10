const mongoose = require('mongoose');

// --- VARIANT SUB-SCHEMAS ---
const SizeSchema = new mongoose.Schema({
    size: { type: String, required: true },       // e.g., 'S', 'M', 'L' or '6', '7', '8'
    stock: { type: Number, required: true, default: 0 },
    priceAdjustment: { type: Number, default: 0 } // +/- from base price
}, { _id: false });

const VariantSchema = new mongoose.Schema({
    color: { type: String, required: true },       // e.g., 'Gold', 'Silver', 'Rose Gold'
    images: [
        {
            url: { type: String, required: true },
            publicId: { type: String, required: true }
        }
    ],
    sizes: [SizeSchema],
    sku: { type: String, required: true }          // Unique per variant, e.g., 'RIN-123456-GOLD'
}, { _id: true });

const ProductSchema = new mongoose.Schema({
    sku: { type: String, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },

    // --- PRICE SECTION ---
    price: { type: Number, required: true },         // Normal Selling Price (e.g., 1500)
    originalPrice: { type: Number, required: true }, // MRP (e.g., 2000)

    // --- SALE PRICE SECTION ---
    salePrice: { type: Number },                     // Sale ke time ka price (e.g., 1000)

    // --- STOCK SECTION (fallback for non-variant products) ---
    stock: { type: Number, required: true, default: 0 },

    // --- SALE CONFIGURATION ---
    onSale: { type: Boolean, default: false },
    saleStartDate: { type: Date },
    saleEndDate: { type: Date },

    // --- LEGACY IMAGES (for products without variants) ---
    images: [
        {
            url: { type: String, required: true },
            publicId: { type: String, required: true }
        }
    ],

    // --- VARIANTS ---
    variants: [VariantSchema],
    hasVariants: { type: Boolean, default: false },

    subCategory: { type: String, required: true },
    bestseller: { type: Boolean, default: false }
}, {
    timestamps: true
});

// Virtual: total stock across all variants (or fallback to stock field)
ProductSchema.virtual('totalVariantStock').get(function () {
    if (!this.variants || this.variants.length === 0) return this.stock;
    return this.variants.reduce((total, variant) => {
        return total + variant.sizes.reduce((sizeTotal, s) => sizeTotal + s.stock, 0);
    }, 0);
});

// Ensure virtuals are included in JSON
ProductSchema.set('toJSON', { virtuals: true });
ProductSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', ProductSchema);