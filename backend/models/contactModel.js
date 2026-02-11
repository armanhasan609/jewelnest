const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: false,
        default: null
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    subject: {
        type: String,
        required: [true, 'Subject is required'],
        trim: true,
        minlength: [3, 'Subject must be at least 3 characters'],
        maxlength: [200, 'Subject cannot exceed 200 characters']
    },
    message: {
        type: String,
        required: [true, 'Message is required'],
        trim: true,
        minlength: [5, 'Message must be at least 5 characters'],
        maxlength: [5000, 'Message cannot exceed 5000 characters']
    },
    phoneNumber: {
        type: String,
        trim: true,
        default: '',
        required: false,
        sparse: true,
        validate: {
            validator: function (v) {
                // Allow empty strings, null, undefined or valid 10-digit numbers
                if (!v || v === '' || v === null) return true;
                return /^[0-9]{10}$/.test(v);
            },
            message: 'Phone number must be 10 digits if provided'
        }
    },
    status: {
        type: String,
        enum: ['unread', 'read', 'replied', 'archived'],
        default: 'unread'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    category: {
        type: String,
        enum: ['general', 'product', 'order', 'shipping', 'return', 'complaint', 'suggestion'],
        default: 'general'
    },
    response: [{
        repliedAt: Date,
        repliedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        message: String,
        notes: String
    }],
    tags: [{
        type: String,
        trim: true
    }],
    source: {
        type: String,
        enum: ['website', 'mobile', 'email', 'phone'],
        default: 'website'
    },
    ipAddress: String,
    userAgent: String,
    attachments: [{
        filename: String,
        path: String,
        mimetype: String,
        size: Number
    }],
    metadata: {
        browser: String,
        os: String,
        device: String,
        referrer: String,
        pageUrl: String
    },
    followUpDate: Date,
    isResolved: {
        type: Boolean,
        default: false
    },
    resolutionDate: Date,
    satisfactionRating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for better query performance
contactSchema.index({ userId: 1 });
contactSchema.index({ status: 1 });
contactSchema.index({ priority: 1 });
contactSchema.index({ createdAt: -1 });
contactSchema.index({ category: 1 });
contactSchema.index({ isResolved: 1 });
contactSchema.index({ assignedTo: 1 });
contactSchema.index({ email: 1 });
contactSchema.index({ tags: 1 });

// Virtual for formatted date
contactSchema.virtual('formattedDate').get(function () {
    return this.createdAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
});

// Static method to get inquiries by status
contactSchema.statics.findByStatus = function (status) {
    return this.find({ status: status }).sort({ createdAt: -1 });
};

// Static method to get unresolved inquiries
contactSchema.statics.findUnresolved = function () {
    return this.find({ isResolved: false }).sort({ priority: -1, createdAt: -1 });
};

// Instance method to mark as read
contactSchema.methods.markAsRead = function () {
    this.status = 'read';
    return this.save();
};

// Instance method to assign to admin
contactSchema.methods.assignToAdmin = function (adminId) {
    this.assignedTo = adminId;
    return this.save();
};

// Instance method to add response
contactSchema.methods.addResponse = function (userId, message, notes = '') {
    if (!this.response) {
        this.response = [];
    }
    this.response.push({
        repliedAt: new Date(),
        repliedBy: userId,
        message: message,
        notes: notes
    });
    this.status = 'replied';
    return this.save();
};

// Instance method to mark as resolved
contactSchema.methods.markAsResolved = function () {
    this.isResolved = true;
    this.resolutionDate = new Date();
    this.status = 'archived';
    return this.save();
};

// Query helper for high priority inquiries
contactSchema.query.highPriority = function () {
    return this.where('priority').in(['high', 'urgent']);
};

// Query helper for recent inquiries
contactSchema.query.recent = function (days = 7) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return this.where('createdAt').gte(date);
};

const contactModel = mongoose.models.contact || mongoose.model('contact', contactSchema);
module.exports = contactModel;