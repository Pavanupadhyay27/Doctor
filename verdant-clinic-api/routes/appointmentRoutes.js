const express = require('express');
const router = express.Router();
const { getAppointments, createAppointment, updateAppointment } = require('../controllers/appointmentController');
const { protect, restrictTo } = require('../middleware/auth');

// Protect and restrict all appointment endpoints
router.use(protect);
router.use(restrictTo('doctor', 'receptionist'));

router.get('/', getAppointments);
router.post('/', createAppointment);
router.patch('/:id', updateAppointment);

module.exports = router;
