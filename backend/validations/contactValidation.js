const Joi = require('joi');

const contactSubmissionSchema = Joi.object({
    userId: Joi.string()
        .allow(null, '')
        .optional(),
    name: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.empty': 'Name is required',
            'string.min': 'Name must be at least 2 characters',
            'string.max': 'Name cannot exceed 100 characters'
        }),
    email: Joi.string()
        .trim()
        .lowercase()
        .email()
        .required()
        .messages({
            'string.empty': 'Email is required',
            'string.email': 'Please enter a valid email address'
        }),
    subject: Joi.string()
        .trim()
        .min(3)
        .max(200)
        .required()
        .messages({
            'string.empty': 'Subject is required',
            'string.min': 'Subject must be at least 3 characters',
            'string.max': 'Subject cannot exceed 200 characters'
        }),
    message: Joi.string()
        .trim()
        .min(5)
        .max(5000)
        .required()
        .messages({
            'string.empty': 'Message is required',
            'string.min': 'Message must be at least 5 characters',
            'string.max': 'Message cannot exceed 5000 characters'
        }),
    phoneNumber: Joi.string()
        .trim()
        .allow('')
        .optional()
        .messages({
            'string.pattern.base': 'Phone number must be 10 digits'
        }),
    category: Joi.string()
        .valid('general', 'product', 'order', 'shipping', 'return', 'complaint', 'suggestion')
        .optional()
        .default('general'),
    priority: Joi.string()
        .valid('low', 'medium', 'high', 'urgent')
        .optional()
        .default('medium')
});

module.exports = {
    contactSubmissionSchema
};
