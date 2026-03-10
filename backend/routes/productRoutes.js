const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { upload } = require('../middleware/upload'); // Multer middleware (AWS S3)

// Use upload.any() to accept dynamically named fields (variant_0, variant_1, etc.)
// For non-variant products, files come as 'image' field
// For variant products, files come as 'variant_0', 'variant_1', etc.

// 1. ADD PRODUCT: POST request
router.post('/add', upload.any(), productController.addProduct);

// 2. LIST ALL PRODUCTS: GET request
router.get('/all', productController.getAllProducts);

// 3. REMOVE PRODUCT: POST request
router.post('/remove', productController.deleteProduct);

// 4. SINGLE PRODUCT: POST request
router.post('/single', productController.singleProduct);

// 5. UPDATE PRODUCT: POST request with image upload
router.post('/update', upload.any(), productController.updateProduct);

module.exports = router;