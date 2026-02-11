const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// 1. Cloudinary Storage Configuration
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'JewelNest_Products', // Cloudinary par auto-folder creation
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'], // 'webp' bhi add kiya (Modern format)
        transformation: [{ width: 1000, height: 1000, crop: 'limit' }] // Images ko auto-resize karega
    },
});

// 2. Filter logic (Sirf images allow karne ke liye)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// 3. Final Multer Setup
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB Limit (Client ke liye safe)
});

module.exports = upload;