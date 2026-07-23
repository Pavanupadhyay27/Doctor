const express = require('express');
const router = express.Router();
const { getPatients, getPatientById, addPatientHistory, updatePatient, uploadDocument, downloadDocument } = require('../controllers/patientController');
const { protect, restrictTo } = require('../middleware/auth');

// Protect all patient routes - only doctors and receptionists can access patient profiles
router.use(protect);
router.use(restrictTo('doctor', 'receptionist'));

router.get('/', getPatients);
router.get('/:id', getPatientById);
router.put('/:id', updatePatient); // Re-added PUT for visit and document logging compatibility
router.post('/:id/history', addPatientHistory);
router.post('/:id/upload', uploadDocument); // Re-added upload file endpoint
router.get('/:id/documents/:docName/download', downloadDocument); // Download document route

module.exports = router;
