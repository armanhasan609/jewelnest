const SubCategory = require('../models/SubCategory');

// Create SubCategory
exports.createSubCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: "SubCategory name is required" });
        }

        const existing = await SubCategory.findOne({ name: name.trim() });
        if (existing) {
            return res.status(400).json({ success: false, message: "SubCategory already exists" });
        }

        const newSubCategory = new SubCategory({ name: name.trim() });
        await newSubCategory.save();

        res.status(201).json({ success: true, message: "SubCategory created successfully", subCategory: newSubCategory });
    } catch (error) {
        console.error("Create SubCategory Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get All SubCategories
exports.getAllSubCategories = async (req, res) => {
    try {
        const subCategories = await SubCategory.find().sort({ name: 1 });
        res.status(200).json({ success: true, subCategories });
    } catch (error) {
        console.error("Get SubCategories Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete SubCategory
exports.deleteSubCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: "SubCategory name is required" });
        }

        const deleted = await SubCategory.findOneAndDelete({ name: name.trim() });

        if (!deleted) {
            return res.status(404).json({ success: false, message: "SubCategory not found in database" });
        }

        res.status(200).json({ success: true, message: "SubCategory deleted successfully" });
    } catch (error) {
        console.error("Delete SubCategory Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
