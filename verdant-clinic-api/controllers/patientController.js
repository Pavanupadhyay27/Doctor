const supabase = require('../config/supabase');

// @desc    Get all patients (with search and pagination)
// @route   GET /api/patients
// @access  Private (Doctor, Receptionist)
exports.getPatients = async (req, res, next) => {
  try {
    const { search, page, limit } = req.query;

    let query = supabase.from('patients').select('*', { count: 'exact' });

    // Search by name or phone
    if (search && search.trim()) {
      const cleanSearch = search.trim();
      query = query.or(`name.ilike.%${cleanSearch}%,phone.ilike.%${cleanSearch}%`);
    }

    query = query.order('created_at', { ascending: false });

    // Pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;
    query = query.range(from, to);

    const { data: patients, count, error } = await query;

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    res.status(200).json({
      success: true,
      total: count || 0,
      page: pageNum,
      limit: limitNum,
      patients: patients || [],
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single patient details (with associated appointment list, history, and docs)
// @route   GET /api/patients/:id
// @access  Private (Doctor, Receptionist)
exports.getPatientById = async (req, res, next) => {
  try {
    // 1. Fetch Patient
    const { data: patient, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error || !patient) {
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }

    // 2. Fetch Appointments
    const { data: appointments } = await supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', patient.id)
      .order('date', { ascending: false });

    // 3. Fetch History (Clinical notes)
    const { data: history } = await supabase
      .from('patient_history')
      .select('*')
      .eq('patient_id', patient.id)
      .order('created_at', { ascending: false });

    // 4. Fetch Visit History (Procedure details)
    const { data: visitHistory } = await supabase
      .from('patient_visits')
      .select('*')
      .eq('patient_id', patient.id)
      .order('created_at', { ascending: false });

    // 5. Fetch Documents
    const { data: documents } = await supabase
      .from('patient_documents')
      .select('*')
      .eq('patient_id', patient.id)
      .order('created_at', { ascending: false });

    // Attach relational rows so they match the schema the frontend expects
    res.status(200).json({
      success: true,
      patient: {
        ...patient,
        appointments: appointments || [],
        history: history || [],
        visitHistory: visitHistory || [],
        documents: documents || [],
      },
      appointments: appointments || [],
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add a clinical history note to the patient timeline
// @route   POST /api/patients/:id/history
// @access  Private (Doctor, Receptionist)
exports.addPatientHistory = async (req, res, next) => {
  try {
    const { note } = req.body;

    if (!note || !note.trim()) {
      return res.status(400).json({ success: false, error: 'Note text is required' });
    }

    const { data: check } = await supabase
      .from('patients')
      .select('id')
      .eq('id', req.params.id)
      .maybeSingle();

    if (!check) {
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }

    // Insert Note
    const { error } = await supabase
      .from('patient_history')
      .insert({
        patient_id: req.params.id,
        note: note.trim(),
      });

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    // Re-fetch full patient object
    return exports.getPatientById(req, res, next);
  } catch (err) {
    next(err);
  }
};

// @desc    Update patient record (handles add_visit, update_fields, add_document actions)
// @route   PUT /api/patients/:id
// @access  Private (Doctor, Receptionist)
exports.updatePatient = async (req, res, next) => {
  try {
    const { action, visitData, fields, docName } = req.body;

    const { data: patient } = await supabase
      .from('patients')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }

    if (action === 'add_visit') {
      await supabase
        .from('patient_visits')
        .insert({
          patient_id: patient.id,
          date: new Date().toISOString().split('T')[0],
          treatment: visitData?.treatment || '',
          notes: visitData?.notes || '',
          cost: visitData?.cost || '',
        });

      // Update patient's last visit field
      await supabase
        .from('patients')
        .update({ last_visit: new Date().toISOString() })
        .eq('id', patient.id);

    } else if (action === 'update_fields') {
      if (fields) {
        const updateFields = {};
        if (fields.name !== undefined) updateFields.name = fields.name;
        if (fields.phone !== undefined) updateFields.phone = fields.phone;
        if (fields.treatmentName !== undefined) updateFields.treatment_name = fields.treatmentName;
        if (fields.plan !== undefined) updateFields.plan = fields.plan;

        await supabase
          .from('patients')
          .update(updateFields)
          .eq('id', patient.id);
      }
    } else if (action === 'add_document') {
      await supabase
        .from('patient_documents')
        .insert({
          patient_id: patient.id,
          name: docName || 'Unnamed Document',
          size: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
          date: new Date().toISOString().split('T')[0],
        });
    }

    // Re-fetch full patient object
    return exports.getPatientById(req, res, next);
  } catch (err) {
    next(err);
  }
};

// @desc    Mock Document upload endpoint
// @route   POST /api/patients/:id/upload
// @access  Private (Doctor, Receptionist)
exports.uploadDocument = async (req, res, next) => {
  try {
    const { data: patient } = await supabase
      .from('patients')
      .select('id')
      .eq('id', req.params.id)
      .maybeSingle();

    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }

    const docName = req.body.fileName || 'scan_result.pdf';
    
    const { error } = await supabase
      .from('patient_documents')
      .insert({
        patient_id: patient.id,
        name: docName,
        size: `${(Math.random() * 2 + 0.5).toFixed(1)} MB`,
        date: new Date().toISOString().split('T')[0],
      });

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    // Re-fetch full patient object
    return exports.getPatientById(req, res, next);
  } catch (err) {
    next(err);
  }
};
