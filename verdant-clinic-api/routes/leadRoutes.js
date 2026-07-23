const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');

const {
  getLeads,
  createLead,
  getLeadById,
  updateLeadStatus,
  addLeadNote,
  sendMessageToLead,
  getDashboardStats,
  updateLead, // Imported for PUT route support
} = require('../controllers/leadController');

const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Anti-spam Rate Limiter for public consultation bookings (5 requests per 10 mins per IP)
const leadCreationLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    error: 'Too many consultation bookings from this IP. Please try again after 10 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation rules for Lead creation
const leadCreationValidation = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .trim(),
  body('treatmentId')
    .optional({ nullable: true })
    .isMongoId()
    .withMessage('Treatment ID must be a valid MongoDB ObjectId'),
  body('email')
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage('Please provide a valid email address'),
];

// Public Route (with anti-spam rate limiter and request validators)
router.post('/', leadCreationLimiter, leadCreationValidation, validate, createLead);

// Protected Routes (requires JWT protect middleware)
router.get('/', protect, getLeads);

// Dashboard statistics aggregation (must be registered BEFORE /:id to prevent Express collision)
router.get('/stats/dashboard', protect, getDashboardStats);

router.get('/:id', protect, getLeadById);
router.put('/:id', protect, updateLead); // Re-added PUT for Notes content saving compatibility
router.patch('/:id/status', protect, updateLeadStatus);
router.post('/:id/notes', protect, addLeadNote);
router.post('/:id/send-message', protect, sendMessageToLead);

module.exports = router;
