const supabase = require('../config/supabase');

// @desc    Get all treatments
// @route   GET /api/treatments
// @access  Public (Used by website consultations booking strip)
exports.getTreatments = async (req, res, next) => {
  try {
    const { data: treatments, error } = await supabase
      .from('treatments')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    res.status(200).json({ success: true, treatments });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new treatment option
// @route   POST /api/treatments
// @access  Private (Doctor only)
exports.createTreatment = async (req, res, next) => {
  try {
    const { name, icon, short, who, steps, recovery, price, faqs } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Treatment name is required' });
    }

    // Check if duplicate exists
    const { data: exists } = await supabase
      .from('treatments')
      .select('id')
      .eq('name', name)
      .limit(1);

    if (exists && exists.length > 0) {
      return res.status(400).json({ success: false, error: 'Treatment already exists with this name' });
    }

    const { data: treatment, error } = await supabase
      .from('treatments')
      .insert({
        name,
        icon: icon || '',
        short: short || '',
        who: who || '',
        steps: steps || [],
        recovery: recovery || '',
        price: price || '',
        faqs: faqs || [],
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    res.status(201).json({ success: true, treatment });
  } catch (err) {
    next(err);
  }
};

// @desc    Update a treatment option
// @route   PUT /api/treatments/:id
// @access  Private (Doctor only)
exports.updateTreatment = async (req, res, next) => {
  try {
    const { name, icon, short, who, steps, recovery, price, faqs } = req.body;

    // Check if record exists
    const { data: check } = await supabase
      .from('treatments')
      .select('id')
      .eq('id', req.params.id)
      .single();

    if (!check) {
      return res.status(404).json({ success: false, error: 'Treatment option not found' });
    }

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (icon !== undefined) updateFields.icon = icon;
    if (short !== undefined) updateFields.short = short;
    if (who !== undefined) updateFields.who = who;
    if (steps !== undefined) updateFields.steps = steps;
    if (recovery !== undefined) updateFields.recovery = recovery;
    if (price !== undefined) updateFields.price = price;
    if (faqs !== undefined) updateFields.faqs = faqs;

    const { data: treatment, error } = await supabase
      .from('treatments')
      .update(updateFields)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    res.status(200).json({ success: true, treatment });
  } catch (err) {
    next(err);
  }
};
