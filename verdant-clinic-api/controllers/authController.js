const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');

// Helper to sign and send JWT cookie/response
const sendTokenResponse = (user, statusCode, res) => {
  // Sign token with 7-day expiry
  const token = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET || 'fallback_secret_key',
    { expiresIn: '7d' }
  );

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
};

// @desc    Register user (Bootstrap doctor or administrative register)
// @route   POST /api/auth/register
// @access  Public (Only for first Doctor bootstrap or via ADMIN_SETUP_KEY / Existing Doctor JWT)
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ success: false, error: 'Email, password, and role are required' });
    }

    // Check if user exists
    const { data: userExists } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (userExists) {
      return res.status(400).json({ success: false, error: 'User already exists with this email' });
    }

    // Check if at least one doctor exists in the database
    const { data: doctorExists } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'doctor')
      .limit(1);

    const hasDoctor = doctorExists && doctorExists.length > 0;

    if (hasDoctor) {
      // Setup security keys if a doctor already exists
      const setupKeyHeader = req.headers['x-admin-setup-key'];
      const setupKeyBody = req.body.adminSetupKey;
      const configuredSetupKey = process.env.ADMIN_SETUP_KEY || 'SuperSecretAdminSetupKey2026!';

      const isValidSetupKey = (setupKeyHeader === configuredSetupKey) || (setupKeyBody === configuredSetupKey);
      
      // Check if current user is logged in and is a doctor
      const isAuthorizedDoctor = req.user && req.user.role === 'doctor';

      if (!isValidSetupKey && !isAuthorizedDoctor) {
        return res.status(403).json({
          success: false,
          error: 'Registration is locked. To add users, authenticate as an existing doctor or provide a valid X-Admin-Setup-Key header.',
        });
      }
    }

    // Hash password before saving to PostgreSQL table
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user in Supabase
    const { data: user, error: insertError } = await supabase
      .from('users')
      .insert({ name, email, password: hashedPassword, role })
      .select()
      .single();

    if (insertError) {
      return res.status(400).json({ success: false, error: insertError.message });
    }

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password' });
    }

    // Query user and select hashed password
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Match password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user details
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    // req.user is populated by protect middleware
    res.status(200).json({
      success: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Logout user / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};
