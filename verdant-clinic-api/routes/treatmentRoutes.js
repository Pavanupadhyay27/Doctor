const express = require('express');
const router = express.Router();
const { getTreatments, createTreatment, updateTreatment } = require('../controllers/treatmentController');
const { protect, restrictTo } = require('../middleware/auth');

// Public route: landing page needs to load treatment metadata
router.get('/', getTreatments);

// Doctor-only administrative routes
router.post('/', protect, restrictTo('doctor'), createTreatment);
router.put('/:id', protect, restrictTo('doctor'), updateTreatment);

module.exports = router;
