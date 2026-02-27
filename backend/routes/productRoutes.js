const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { upload } = require('../middleware/upload'); // Multer middleware (AWS S3)

// 1. ADD PRODUCT: POST request
// Frontend se 'image' key mein multiple files aa sakti hain
router.post('/add', upload.array('image'), productController.addProduct);

// 2. LIST ALL PRODUCTS: GET request
router.get('/all', productController.getAllProducts);

// 3. REMOVE PRODUCT: POST request (या DELETE)
// Humne controller mein req.body.id use kiya hai, isliye ise POST rakhna behtar hai
router.post('/remove', productController.deleteProduct);

// 4. SINGLE PRODUCT: POST request
router.post('/single', productController.singleProduct);

// 5. UPDATE PRODUCT: POST request with image upload
router.post('/update', upload.array('image'), productController.updateProduct);

module.exports = router;    