const supabase = require('../config/supabase');
const { sendWhatsApp, compileTemplate } = require('../services/messagingService');

// @desc    Get appointments list (supports month=YYYY-MM filtering)
// @route   GET /api/appointments
// @access  Private (Doctor, Receptionist)
exports.getAppointments = async (req, res, next) => {
  try {
    let query = supabase.from('appointments').select('*');

    // Filter appointments within a specific month (YYYY-MM format)
    if (req.query.month) {
      const [year, monthStr] = req.query.month.split('-');
      const month = parseInt(monthStr, 10);
      
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      
      query = query.gte('date', startDate.toISOString()).lte('date', endDate.toISOString());
    }

    const { data: appointments, error } = await query.order('date', { ascending: true }).order('time', { ascending: true });

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    res.status(200).json({ success: true, appointments });
  } catch (err) {
    next(err);
  }
};

// @desc    Book a new appointment
// @route   POST /api/appointments
// @access  Private (Doctor, Receptionist)
exports.createAppointment = async (req, res, next) => {
  try {
    const { patientId, date, time } = req.body;

    if (!patientId || !date || !time) {
      return res.status(400).json({ success: false, error: 'Patient ID, date, and time are required' });
    }

    const { data: patient, error: patientErr } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .maybeSingle();

    if (patientErr || !patient) {
      return res.status(404).json({ success: false, error: 'Patient profile not found' });
    }

    // Create appointment
    const { data: appointment, error } = await supabase
      .from('appointments')
      .insert({
        patient_id: patient.id,
        patient_name: patient.name,
        treatment_name: patient.treatment_name || '',
        date: new Date(date).toISOString(),
        time,
        status: 'booked',
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    // Update patient next appointment date
    await supabase
      .from('patients')
      .update({ next_appt: new Date(date).toISOString() })
      .eq('id', patient.id);

    // Trigger WhatsApp notification if templates are configured
    try {
      const { data: template } = await supabase
        .from('templates')
        .select('*')
        .eq('name', 'Appointment Reminder')
        .maybeSingle();

      if (template && patient.phone) {
        const bodyContent = compileTemplate(template.body, {
          PatientName: patient.name,
          AppointmentDate: date,
          AppointmentTime: time,
        });

        await sendWhatsApp(patient.phone, bodyContent);

        // Record messaging event in Lead log if linked
        if (patient.lead_id) {
          await supabase
            .from('lead_messages')
            .insert({
              lead_id: patient.lead_id,
              channel: 'WhatsApp',
              direction: 'outbound',
              body: bodyContent,
            });
        }
      }
    } catch (msgErr) {
      console.error('WhatsApp dispatch notification failed:', msgErr.message);
    }

    res.status(201).json({ success: true, appointment });
  } catch (err) {
    next(err);
  }
};

// @desc    Reschedule or update status of an appointment
// @route   PATCH /api/appointments/:id
// @access  Private (Doctor, Receptionist)
exports.updateAppointment = async (req, res, next) => {
  try {
    const { date, time, status } = req.body;

    const { data: appointment } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    const { data: patient } = await supabase
      .from('patients')
      .select('*')
      .eq('id', appointment.patient_id)
      .maybeSingle();

    const updateFields = {};

    // Handle rescheduling
    if (date || time) {
      const oldDate = new Date(appointment.date).toISOString().split('T')[0];
      const oldTime = appointment.time;

      if (date) updateFields.date = new Date(date).toISOString();
      if (time) updateFields.time = time;

      // Update patient's next appointment date
      if (patient) {
        await supabase
          .from('patients')
          .update({ next_appt: new Date(date || appointment.date).toISOString() })
          .eq('id', patient.id);
      }

      // Log to associated Lead notes timeline
      if (patient && patient.lead_id) {
        const newDateStr = date ? new Date(date).toISOString().split('T')[0] : oldDate;
        const newTimeStr = time ? time : oldTime;

        await supabase
          .from('lead_notes')
          .insert({
            lead_id: patient.lead_id,
            text: `Appointment rescheduled from ${oldDate} ${oldTime} to ${newDateStr} ${newTimeStr} via calendar drag/update`,
            system: true,
          });
      }
    }

    // Handle status updates
    if (status) {
      const lowerStatus = status.toLowerCase();
      if (!['booked', 'converted', 'cancelled'].includes(lowerStatus)) {
        return res.status(400).json({ success: false, error: 'Invalid status. Must be booked, converted, or cancelled' });
      }

      updateFields.status = lowerStatus;

      // Completed visit status hook
      if (lowerStatus === 'converted' && patient) {
        // Update patient visit date
        await supabase
          .from('patients')
          .update({
            last_visit: new Date().toISOString(),
            next_appt: null,
          })
          .eq('id', patient.id);

        // Prepend patient history entry
        await supabase
          .from('patient_history')
          .insert({
            patient_id: patient.id,
            note: `Completed appointment for "${appointment.treatment_name || 'Skin Treatment'}"`,
          });
      }
    }

    const { data: updatedAppointment, error } = await supabase
      .from('appointments')
      .update(updateFields)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    res.status(200).json({ success: true, appointment: updatedAppointment });
  } catch (err) {
    next(err);
  }
};
