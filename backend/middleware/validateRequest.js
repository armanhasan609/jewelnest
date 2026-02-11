// middleware/validateRequest.js
const Joi = require('joi');

const validateRequest = (schema) => {
    return (req, res, next) => {
        // Validate with options to allow unknown fields and strip them
        const { error, value } = schema.validate(req.body, {
            abortEarly: false, // Get all errors
            stripUnknown: true, // Remove unknown fields
            allowUnknown: false // Don't allow extra fields
        });

        if (error) {
            console.error("Validation Error:", error.details);
            const errorMessage = error.details.map(detail => detail.message).join(', ');
            return res.status(400).json({
                success: false,
                message: errorMessage,
                errors: error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message
                }))
            });
        }

        // Replace req.body with validated value
        req.body = value;
        next();
    };
};

module.exports = validateRequest;