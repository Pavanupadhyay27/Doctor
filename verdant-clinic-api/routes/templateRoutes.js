const express = require('express');
const router = express.Router();
const { getTemplates, createTemplate, updateTemplate, previewTemplate } = require('../controllers/templateController');
const { protect, restrictTo } = require('../middleware/auth');

// All template routes require authentication
router.use(protect);

// Receptionist and Doctor can list templates to send messages
router.get('/', restrictTo('doctor', 'receptionist'), getTemplates);

// Settings/management endpoints are restricted strictly to doctors
router.post('/', restrictTo('doctor'), createTemplate);
router.put('/:id', restrictTo('doctor'), updateTemplate);
router.post('/:id/preview', restrictTo('doctor'), previewTemplate);

module.exports = router;
