const express = require('express');
const router = express.Router();
const { createSubCategory, getAllSubCategories, deleteSubCategory } = require('../controllers/subCategoryController');

router.post('/add', createSubCategory);
router.get('/all', getAllSubCategories);
router.post('/delete', deleteSubCategory);

module.exports = router;
