const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

// Protect routes via JWT (header or cookies)
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for Authorization Header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check for token in cookies
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this resource. Token missing.',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');

    // Retrieve user from Supabase and attach to request
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role')
      .eq('id', decoded.id)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'The user belonging to this token no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth verification error:', err.message);
    return res.status(401).json({
      success: false,
      error: 'Not authorized. Invalid or expired token.',
    });
  }
};

// Authorize specific roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to perform this action.',
      });
    }
    next();
  };
};
