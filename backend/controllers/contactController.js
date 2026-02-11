const contactModel = require('../models/contactModel');
const User = require('../models/userModel');

// Save Message (User side)
const saveMessage = async (req, res) => {
    try {
        console.log("=== CONTACT FORM SUBMISSION ===");
        console.log("Request body:", JSON.stringify(req.body, null, 2));
        console.log("Request headers:", JSON.stringify(req.headers, null, 2));

        const { userId, name, email, subject, message, phoneNumber, category, priority } = req.body;

        // Validation - make userId optional for guest messages
        if (!name || !email || !subject || !message) {
            console.log("Missing required fields:", { name: !!name, email: !!email, subject: !!subject, message: !!message });
            return res.status(400).json({
                success: false,
                message: "Please fill in all required fields (name, email, subject, message)."
            });
        }

        // Trim and validate fields
        const trimmedName = String(name).trim();
        const trimmedEmail = String(email).trim().toLowerCase();
        const trimmedSubject = String(subject).trim();
        const trimmedMessage = String(message).trim();

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address."
            });
        }

        // Validate lengths
        if (trimmedName.length < 2 || trimmedName.length > 100) {
            return res.status(400).json({
                success: false,
                message: "Name must be between 2 and 100 characters."
            });
        }

        if (trimmedSubject.length < 3 || trimmedSubject.length > 200) {
            return res.status(400).json({
                success: false,
                message: "Subject must be between 3 and 200 characters."
            });
        }

        if (trimmedMessage.length < 5 || trimmedMessage.length > 5000) {
            return res.status(400).json({
                success: false,
                message: "Message must be between 5 and 5000 characters."
            });
        }

        // Build data object - DO NOT include phoneNumber if empty
        const dataToSave = {
            name: trimmedName,
            email: trimmedEmail,
            subject: trimmedSubject,
            message: trimmedMessage,
            category: category || 'general',
            priority: priority || 'medium',
            status: 'unread',
            isResolved: false
        };

        // Only add userId if it's a valid ObjectId
        if (userId && userId !== 'anonymous' && userId !== 'null' && userId !== '') {
            dataToSave.userId = userId;
        }

        // Only add phoneNumber if it exists and is valid
        if (phoneNumber && String(phoneNumber).trim().length > 0) {
            const trimmedPhone = String(phoneNumber).trim();
            if (!/^[0-9]{10}$/.test(trimmedPhone)) {
                return res.status(400).json({
                    success: false,
                    message: "Phone number must be exactly 10 digits."
                });
            }
            dataToSave.phoneNumber = trimmedPhone;
        }

        console.log("Creating contact document with data:", JSON.stringify(dataToSave, null, 2));

        // Create and save new message
        const newMessage = new contactModel(dataToSave);

        console.log("Attempting to save message...");
        const savedMessage = await newMessage.save();
        console.log("Message saved successfully with ID:", savedMessage._id);

        res.status(201).json({
            success: true,
            message: "Your message has been received successfully! Our support team will contact you soon.",
            data: {
                inquiryId: savedMessage._id,
                referenceNumber: `INQ-${savedMessage._id.toString().slice(-6).toUpperCase()}`,
                estimatedResponseTime: "24 hours"
            }
        });

    } catch (error) {
        console.error("=== SAVE MESSAGE ERROR ===");
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);

        if (error.errors) {
            console.error("Mongoose validation errors:");
            Object.keys(error.errors).forEach(key => {
                console.error(`  - ${key}: ${error.errors[key].message}`);
            });
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const validationMessages = Object.entries(error.errors)
                .map(([field, err]) => `${field}: ${err.message}`)
                .join(', ');

            return res.status(400).json({
                success: false,
                message: `Validation failed: ${validationMessages}`,
                errors: error.errors
            });
        }

        // Handle duplicate key errors
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "A message with this information already exists."
            });
        }

        // Generic error
        res.status(500).json({
            success: false,
            message: "Failed to save message. Please try again later.",
            error: process.env.NODE_ENV === 'development' ? {
                name: error.name,
                message: error.message,
                stack: error.stack
            } : undefined
        });
    }
};

// Get all messages (Admin side)
const getMessages = async (req, res) => {
    try {
        const { status, category, priority, page = 1, limit = 20, search } = req.query;

        let filter = {};

        // Apply filters
        if (status) filter.status = status;
        if (category) filter.category = category;
        if (priority) filter.priority = priority;

        // Search functionality
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { subject: { $regex: search, $options: 'i' } },
                { message: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        // Get messages with pagination
        const messages = await contactModel.find(filter)
            .populate('userId', 'name email phoneNumber')
            .populate('assignedTo', 'name email')
            .sort({ createdAt: -1, priority: 1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        // Get total count for pagination
        const total = await contactModel.countDocuments(filter);
        const totalPages = Math.ceil(total / limit);

        res.json({
            success: true,
            data: messages,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        });

    } catch (error) {
        console.error("Get Messages Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch messages."
        });
    }
};

// Delete message
const deleteMessage = async (req, res) => {
    try {
        // Handle both POST (with body) and DELETE (with params) methods
        const id = req.params.id || req.body.id;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Inquiry ID is required."
            });
        }

        const inquiry = await contactModel.findById(id);

        if (!inquiry) {
            return res.status(404).json({
                success: false,
                message: "Inquiry not found."
            });
        }

        // Hard delete
        await contactModel.findByIdAndDelete(id);

        console.log(`Inquiry ${id} deleted by admin`);

        res.json({
            success: true,
            message: "Inquiry deleted successfully."
        });

    } catch (error) {
        console.error("Delete Message Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete inquiry."
        });
    }
};

// List inquiries with user details
const listInquiry = async (req, res) => {
    try {
        const {
            status,
            category,
            startDate,
            endDate,
            assignedTo,
            isResolved,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        let filter = {};

        // Apply filters
        if (status) filter.status = status;
        if (category) filter.category = category;
        if (assignedTo) filter.assignedTo = assignedTo;
        if (isResolved !== undefined) filter.isResolved = isResolved === 'true';

        // Date range filter
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate);
        }

        // Sort configuration
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Get inquiries with detailed user info
        const messages = await contactModel.find(filter)
            .populate('userId', 'name email phoneNumber')
            .populate('assignedTo', 'name email role')
            .sort(sort)
            .lean();

        res.json({
            success: true,
            count: messages.length,
            data: messages
        });

    } catch (error) {
        console.error("List Inquiry Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch inquiries."
        });
    }
};

// Update inquiry status
const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminId } = req.body;

        if (!id || !status) {
            return res.status(400).json({
                success: false,
                message: "Inquiry ID and status are required."
            });
        }

        const inquiry = await contactModel.findById(id);

        if (!inquiry) {
            return res.status(404).json({
                success: false,
                message: "Inquiry not found."
            });
        }

        inquiry.status = status;

        // If marking as archived, set as resolved
        if (status === 'archived') {
            inquiry.isResolved = true;
            inquiry.resolutionDate = new Date();
        }

        await inquiry.save();

        res.json({
            success: true,
            message: `Inquiry marked as ${status}.`,
            data: inquiry
        });

    } catch (error) {
        console.error("Update Status Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update inquiry status."
        });
    }
};

// Assign inquiry to admin
const assignInquiry = async (req, res) => {
    try {
        const { id } = req.params;
        const { adminId } = req.body;

        if (!id || !adminId) {
            return res.status(400).json({
                success: false,
                message: "Inquiry ID and Admin ID are required."
            });
        }

        const inquiry = await contactModel.findById(id);

        if (!inquiry) {
            return res.status(404).json({
                success: false,
                message: "Inquiry not found."
            });
        }

        // Check if admin exists
        const admin = await User.findById(adminId);
        if (!admin || admin.role !== 'admin') {
            return res.status(400).json({
                success: false,
                message: "Invalid admin ID."
            });
        }

        inquiry.assignedTo = adminId;
        await inquiry.save();

        res.json({
            success: true,
            message: `Inquiry assigned to ${admin.name}.`,
            data: inquiry
        });

    } catch (error) {
        console.error("Assign Inquiry Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to assign inquiry."
        });
    }
};

// Add response to inquiry
const addResponse = async (req, res) => {
    try {
        const { id } = req.params;
        const { adminId, message, notes } = req.body;

        if (!id || !adminId || !message) {
            return res.status(400).json({
                success: false,
                message: "Inquiry ID, Admin ID, and response message are required."
            });
        }

        const inquiry = await contactModel.findById(id);

        if (!inquiry) {
            return res.status(404).json({
                success: false,
                message: "Inquiry not found."
            });
        }

        // Add response to array
        if (!inquiry.response) {
            inquiry.response = [];
        }

        inquiry.response.push({
            repliedBy: adminId,
            message: message,
            notes: notes || '',
            repliedAt: new Date()
        });

        inquiry.status = 'replied';
        await inquiry.save();

        res.json({
            success: true,
            message: "Response added successfully.",
            data: inquiry
        });

    } catch (error) {
        console.error("Add Response Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to add response."
        });
    }
};

// Get inquiry statistics
const getInquiryStats = async (req, res) => {
    try {
        const total = await contactModel.countDocuments();
        const unread = await contactModel.countDocuments({ status: 'unread' });
        const read = await contactModel.countDocuments({ status: 'read' });
        const replied = await contactModel.countDocuments({ status: 'replied' });
        const resolved = await contactModel.countDocuments({ isResolved: true });

        res.json({
            success: true,
            data: {
                total,
                unread,
                read,
                replied,
                resolved,
                pending: total - resolved
            }
        });
    } catch (error) {
        console.error("Get Stats Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch statistics."
        });
    }
};

// Get single message and mark as read
const getMessageById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('=== GET MESSAGE BY ID ===');
        console.log('Message ID:', id);

        let inquiry = await contactModel.findById(id)
            .populate('userId', 'name email phoneNumber')
            .populate('assignedTo', 'name email')
            .populate('response.repliedBy', 'name email');

        if (!inquiry) {
            console.log('Inquiry not found for ID:', id);
            return res.status(404).json({
                success: false,
                message: 'Inquiry not found'
            });
        }

        console.log('Current status before:', inquiry.status);

        // Auto-mark as read if currently unread
        if (inquiry.status === 'unread') {
            console.log('Marking message as read...');
            inquiry.status = 'read';
            inquiry = await inquiry.save(); // Re-assign the saved document
            console.log('Current status after:', inquiry.status);
            console.log('Message marked as read successfully!');
        } else {
            console.log('Message already read, status:', inquiry.status);
        }

        // Return the updated document
        res.json({
            success: true,
            data: inquiry,
            statusChanged: inquiry.status === 'read'
        });
    } catch (error) {
        console.error('=== GET MESSAGE ERROR ===');
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Export all functions
module.exports = {
    saveMessage,
    getMessages,
    deleteMessage,
    listInquiry,
    updateStatus,
    assignInquiry,
    addResponse,
    getInquiryStats,
    getMessageById
};