const supabase = require('../config/supabase');
const messagingService = require('../services/messagingService');

// Helper to map status to lowercase enums
const mapStatus = (status) => {
  if (!status) return 'new';
  const s = status.toLowerCase();
  return ['new', 'contacted', 'booked', 'converted', 'lost'].includes(s) ? s : 'new';
};

// @desc    Get all leads (with search, filtering, sorting, and pagination)
// @route   GET /api/leads
// @access  Private (Doctor, Receptionist)
exports.getLeads = async (req, res, next) => {
  try {
    const { status, treatmentId, search, sortBy, sortDir, page, limit } = req.query;

    let query = supabase.from('leads').select('*', { count: 'exact' });

    // 1. Status Filter
    if (status) {
      query = query.eq('status', mapStatus(status));
    }

    // 2. Treatment Filter
    if (treatmentId) {
      query = query.eq('treatment_id', treatmentId);
    }

    // 3. Search Filter (ilike matches)
    if (search && search.trim()) {
      const cleanSearch = search.trim();
      query = query.or(`name.ilike.%${cleanSearch}%,phone.ilike.%${cleanSearch}%,treatment_name.ilike.%${cleanSearch}%`);
    }

    // 4. Sorting
    const sortField = sortBy || 'created_at';
    const ascending = sortDir === 'asc';
    query = query.order(sortField, { ascending });

    // 5. Pagination range
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;
    query = query.range(from, to);

    const { data: leads, count, error } = await query;

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    res.status(200).json({
      success: true,
      total: count,
      page: pageNum,
      limit: limitNum,
      leads: leads || [],
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get detailed lead info (populated with associated Notes and Messages)
// @route   GET /api/leads/:id
// @access  Private (Doctor, Receptionist)
exports.getLeadById = async (req, res, next) => {
  try {
    // 1. Fetch Lead
    const { data: lead, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error || !lead) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }

    // 2. Fetch Notes (Relational)
    const { data: notes } = await supabase
      .from('lead_notes')
      .select('*')
      .eq('lead_id', lead.id)
      .order('created_at', { ascending: true });

    // 3. Fetch Messages (Relational)
    const { data: messages } = await supabase
      .from('lead_messages')
      .select('*')
      .eq('lead_id', lead.id)
      .order('created_at', { ascending: false });

    // Format structure to match frontend expectations
    res.status(200).json({
      success: true,
      lead: {
        ...lead,
        notes: notes || [],
        messages: messages || [],
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit a new lead (public endpoint for landing page forms)
// @route   POST /api/leads
// @access  Public
exports.createLead = async (req, res, next) => {
  try {
    const { name, phone, email, treatmentId, source, message } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, error: 'Name and phone number are required' });
    }

    // Lookup treatment procedure details if treatmentId is provided
    let treatmentName = '';
    if (treatmentId) {
      const { data: treatment } = await supabase
        .from('treatments')
        .select('name')
        .eq('id', treatmentId)
        .maybeSingle();
      if (treatment) {
        treatmentName = treatment.name;
      }
    }

    // Insert lead
    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        name,
        phone,
        email: email || '',
        treatment_id: treatmentId || null,
        treatment_name: treatmentName,
        source: source || 'Website',
        status: 'new',
        message: message || '',
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    // Trigger asynchronous welcome notification
    try {
      const logEntry = await messagingService.sendAutoWelcome(lead);
      if (logEntry) {
        // Insert message log entry
        await supabase
          .from('lead_messages')
          .insert({
            lead_id: lead.id,
            channel: logEntry.channel,
            direction: logEntry.direction,
            body: logEntry.body,
          });
      }
    } catch (msgErr) {
      console.error('Auto-welcome message dispatch failed:', msgErr.message);
    }

    res.status(201).json({ success: true, lead });
  } catch (err) {
    next(err);
  }
};

// @desc    Update lead status (and trigger patient creation on 'converted')
// @route   PATCH /api/leads/:id/status
// @access  Private (Doctor, Receptionist)
exports.updateLeadStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }

    const { data: lead, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error || !lead) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }

    const oldStatus = lead.status;
    const parsedStatus = mapStatus(status);

    // Update status in Supabase
    const { data: updatedLead, error: updateError } = await supabase
      .from('leads')
      .update({ status: parsedStatus })
      .eq('id', lead.id)
      .select()
      .single();

    if (updateError) {
      return res.status(400).json({ success: false, error: updateError.message });
    }

    // Insert timeline note
    await supabase
      .from('lead_notes')
      .insert({
        lead_id: lead.id,
        text: `Pipeline status updated from ${oldStatus} to ${parsedStatus}`,
        system: true,
      });

    let patient = null;

    // Handle auto conversion to Patient
    if (parsedStatus === 'converted') {
      const { data: patientExists } = await supabase
        .from('patients')
        .select('*')
        .eq('lead_id', lead.id)
        .maybeSingle();

      if (!patientExists) {
        // Create Patient
        const { data: newPatient } = await supabase
          .from('patients')
          .insert({
            lead_id: lead.id,
            name: lead.name,
            phone: lead.phone,
            treatment_name: lead.treatment_name,
            plan: lead.message ? `Consultation details: "${lead.message}". Plan pending.` : 'Converted from lead. Plan pending.',
          })
          .select()
          .single();

        patient = newPatient;

        // Add history timeline log
        if (newPatient) {
          await supabase
            .from('patient_history')
            .insert({
              patient_id: newPatient.id,
              note: 'Patient account auto-created from converted pipeline lead.',
            });
        }
      } else {
        patient = patientExists;
      }
    }

    res.status(200).json({
      success: true,
      lead: updatedLead,
      patient,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Append manual note to Lead timeline
// @route   POST /api/leads/:id/notes
// @access  Private (Doctor, Receptionist)
exports.addLeadNote = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, error: 'Note text is required' });
    }

    const { data: lead } = await supabase
      .from('leads')
      .select('id')
      .eq('id', req.params.id)
      .maybeSingle();

    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }

    // Insert Note
    const { data: note, error } = await supabase
      .from('lead_notes')
      .insert({
        lead_id: req.params.id,
        text: text.trim(),
        system: false,
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    // Re-fetch lead detail
    const { data: leadFull } = await supabase.from('leads').select('*').eq('id', req.params.id).single();
    const { data: notes } = await supabase.from('lead_notes').select('*').eq('lead_id', req.params.id).order('created_at', { ascending: true });
    const { data: messages } = await supabase.from('lead_messages').select('*').eq('lead_id', req.params.id).order('created_at', { ascending: false });

    res.status(200).json({
      success: true,
      lead: { ...leadFull, notes: notes || [], messages: messages || [] },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Dispatches a custom message or template to the lead
// @route   POST /api/leads/:id/send-message
// @access  Private (Doctor, Receptionist)
exports.sendMessageToLead = async (req, res, next) => {
  try {
    const { templateId, customBody, channel } = req.body;

    const { data: lead } = await supabase
      .from('leads')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }

    // Dispatch via messaging service
    const logEntry = await messagingService.send({
      templateId,
      customBody,
      channel,
      recipientEmail: lead.email,
      recipientPhone: lead.phone,
      variables: {
        PatientName: lead.name,
        TreatmentInterested: lead.treatment_name,
      },
    });

    if (logEntry) {
      // Save messaging event log
      await supabase
        .from('lead_messages')
        .insert({
          lead_id: lead.id,
          channel: logEntry.channel,
          direction: logEntry.direction,
          body: logEntry.body,
        });
    }

    // Re-fetch lead detail
    const { data: leadFull } = await supabase.from('leads').select('*').eq('id', req.params.id).single();
    const { data: notes } = await supabase.from('lead_notes').select('*').eq('lead_id', req.params.id).order('created_at', { ascending: true });
    const { data: messages } = await supabase.from('lead_messages').select('*').eq('lead_id', req.params.id).order('created_at', { ascending: false });

    res.status(200).json({
      success: true,
      lead: { ...leadFull, notes: notes || [], messages: messages || [] },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Generic Update Lead (handles update_status, add_note, save_notes_content for compatibility)
// @route   PUT /api/leads/:id
// @access  Private (Doctor, Receptionist)
exports.updateLead = async (req, res, next) => {
  try {
    const { action, status, text, notesContent } = req.body;

    const { data: lead } = await supabase
      .from('leads')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }

    if (action === 'update_status') {
      const oldStatus = lead.status;
      const parsedStatus = mapStatus(status);

      await supabase.from('leads').update({ status: parsedStatus }).eq('id', lead.id);
      await supabase.from('lead_notes').insert({
        lead_id: lead.id,
        text: `Pipeline status updated from ${oldStatus} to ${parsedStatus}`,
        system: true,
      });

      if (parsedStatus === 'converted') {
        const { data: patientExists } = await supabase.from('patients').select('id').eq('lead_id', lead.id).maybeSingle();
        if (!patientExists) {
          const { data: newPatient } = await supabase.from('patients').insert({
            lead_id: lead.id,
            name: lead.name,
            phone: lead.phone,
            treatment_name: lead.treatment_name,
            plan: lead.message || 'Converted from lead. Plan pending.',
          }).select().single();

          if (newPatient) {
            await supabase.from('patient_history').insert({
              patient_id: newPatient.id,
              note: 'Patient account auto-created from converted pipeline lead.',
            });
          }
        }
      }
    } else if (action === 'add_note') {
      await supabase.from('lead_notes').insert({
        lead_id: lead.id,
        text: text.trim(),
        system: false,
      });
    } else if (action === 'save_notes_content') {
      await supabase.from('leads').update({ message: notesContent }).eq('id', lead.id);
    }

    // Re-fetch lead detail
    const { data: leadFull } = await supabase.from('leads').select('*').eq('id', req.params.id).single();
    const { data: notes } = await supabase.from('lead_notes').select('*').eq('lead_id', req.params.id).order('created_at', { ascending: true });
    const { data: messages } = await supabase.from('lead_messages').select('*').eq('lead_id', req.params.id).order('created_at', { ascending: false });

    res.status(200).json({
      success: true,
      lead: { ...leadFull, notes: notes || [], messages: messages || [] },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Fetch CRM Dashboard aggregated stats
// @route   GET /api/leads/stats/dashboard
// @access  Private (Doctor, Receptionist)
exports.getDashboardStats = async (req, res, next) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    // 1. Leads Created Today
    const { count: newToday } = await supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startOfToday.toISOString())
      .lte('created_at', endOfToday.toISOString());

    // 2. Pending Followups (status = new AND older than 24 hours)
    const { count: pendingFollowups } = await supabase
      .from('leads')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'new')
      .lt('created_at', oneDayAgo.toISOString());

    // 3. Scheduled Appointments this week
    const today = new Date();
    const currentDay = today.getDay();
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() + distanceToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const { count: apptsThisWeek } = await supabase
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .gte('date', startOfWeek.toISOString())
      .lte('date', endOfWeek.toISOString());

    // 4. Conversion Rate
    const { count: totalLeads } = await supabase.from('leads').select('id', { count: 'exact', head: true });
    const { count: convertedLeads } = await supabase.from('leads').select('id', { count: 'exact', head: true }).eq('status', 'converted');
    const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

    // 5. Last 7 Days Counts
    const last7DaysCounts = [];
    for (let i = 6; i >= 0; i--) {
      const start = new Date();
      start.setDate(start.getDate() - i);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setHours(23, 59, 59, 999);

      const { count } = await supabase
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());
      
      last7DaysCounts.push(count || 0);
    }

    // 6. Source Breakdown
    const { data: sources } = await supabase.from('leads').select('source');
    const channelBreakdown = {};
    sources?.forEach((item) => {
      const src = item.source || 'Website';
      channelBreakdown[src] = (channelBreakdown[src] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      stats: {
        newToday: newToday || 0,
        pendingFollowups: pendingFollowups || 0,
        apptsThisWeek: apptsThisWeek || 0,
        conversionRate,
        last7DaysCounts,
        channelBreakdown,
      },
    });
  } catch (err) {
    next(err);
  }
};
