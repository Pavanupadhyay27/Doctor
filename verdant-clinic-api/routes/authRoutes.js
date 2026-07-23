const express = require('express');
const router = express.Router();
const { register, login, getMe, logout } = require('../controllers/authController');
const { protect, restrictTo } = require('../middleware/auth');

// Public route for login
router.post('/login', login);

// Protected routes
router.get('/logout', protect, logout);
router.get('/me', protect, getMe);

// Register route: Runs protect and restrictTo if token exists; otherwise bypasses to controller for bootstrap/key check
router.post(
  '/register',
  (req, res, next) => {
    const hasToken = (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) || (req.cookies && req.cookies.token);
    if (hasToken) {
      return protect(req, res, () => restrictTo('doctor')(req, res, next));
    }
    next();
  },
  register
);

module.exports = router;
