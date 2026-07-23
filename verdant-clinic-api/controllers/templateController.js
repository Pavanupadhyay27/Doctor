const supabase = require('../config/supabase');
const { compileTemplate } = require('../services/messagingService');

// @desc    Get all templates
// @route   GET /api/templates
// @access  Private (Doctor, Receptionist)
exports.getTemplates = async (req, res, next) => {
  try {
    const { data: templates, error } = await supabase
      .from('templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    res.status(200).json({ success: true, templates });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a communication template
// @route   POST /api/templates
// @access  Private (Doctor setting)
exports.createTemplate = async (req, res, next) => {
  try {
    const { name, channel, subject, body, image } = req.body;

    if (!name || !channel || !body) {
      return res.status(400).json({ success: false, error: 'Name, channel, and body are required' });
    }

    if (!['Email', 'SMS', 'WhatsApp'].includes(channel)) {
      return res.status(400).json({ success: false, error: 'Channel must be Email, SMS, or WhatsApp' });
    }

    const { data: template, error } = await supabase
      .from('templates')
      .insert({
        name,
        channel,
        subject: subject || '',
        body,
        image: image || '',
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    res.status(201).json({ success: true, template });
  } catch (err) {
    next(err);
  }
};

// @desc    Update an existing template
// @route   PUT /api/templates/:id
// @access  Private (Doctor setting)
exports.updateTemplate = async (req, res, next) => {
  try {
    const { name, channel, subject, body, image } = req.body;

    const { data: check } = await supabase
      .from('templates')
      .select('id')
      .eq('id', req.params.id)
      .single();

    if (!check) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }

    if (channel && !['Email', 'SMS', 'WhatsApp'].includes(channel)) {
      return res.status(400).json({ success: false, error: 'Channel must be Email, SMS, or WhatsApp' });
    }

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (channel !== undefined) updateFields.channel = channel;
    if (subject !== undefined) updateFields.subject = subject;
    if (body !== undefined) updateFields.body = body;
    if (image !== undefined) updateFields.image = image;

    const { data: template, error } = await supabase
      .from('templates')
      .update(updateFields)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    res.status(200).json({ success: true, template });
  } catch (err) {
    next(err);
  }
};

// @desc    Get rendered template preview with merged placeholder fields
// @route   POST /api/templates/:id/preview
// @access  Private (Doctor setting)
exports.previewTemplate = async (req, res, next) => {
  try {
    const { data: template, error } = await supabase
      .from('templates')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !template) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }

    // Pull a sample lead from Supabase
    const { data: sampleLead } = await supabase
      .from('leads')
      .select('*')
      .limit(1)
      .maybeSingle();

    const leadName = sampleLead ? sampleLead.name : 'Elena Rostova';
    const leadTreatment = sampleLead ? (sampleLead.treatment_name || 'Chemical Peels') : 'Chemical Peels';

    const variables = {
      PatientName: leadName,
      TreatmentInterested: leadTreatment,
      AppointmentDate: new Date().toISOString().split('T')[0],
      AppointmentTime: '10:30 AM',
    };

    const renderedBody = compileTemplate(template.body, variables);

    res.status(200).json({
      success: true,
      templateName: template.name,
      channel: template.channel,
      subject: template.subject ? compileTemplate(template.subject, variables) : '',
      renderedBody,
      sampleDataUsed: {
        name: leadName,
        treatment: leadTreatment,
      },
    });
  } catch (err) {
    next(err);
  }
};
