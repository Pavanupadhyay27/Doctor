require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');

const errorHandler = require('./middleware/errorHandler');
const { protect } = require('./middleware/auth');

// Models for the master CRM bootstrap route
// (No longer importing Mongoose models - replaced by Supabase queries)

// Route Imports
const authRoutes = require('./routes/authRoutes');
const leadRoutes = require('./routes/leadRoutes');
const patientRoutes = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const templateRoutes = require('./routes/templateRoutes');
const treatmentRoutes = require('./routes/treatmentRoutes');

const app = express();

// Security Headers
app.use(helmet());

// Cookie Parser (supporting JWT cookie auth)
app.use(cookieParser(process.env.COOKIE_SECRET || 'cookie_secret_fallback'));

// CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'https://doctor-three.vercel.app',
  'https://doctor-three-sigma.vercel.app',
  'https://doctor-three.sigma.vercel.app'
];

if (process.env.CLIENT_ORIGIN) {
  const envOrigins = process.env.CLIENT_ORIGIN.split(',').map(o => o.trim());
  allowedOrigins.push(...envOrigins);
}

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(null, true); // Fallback to accept other origins but with correct header response
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Body Parser
app.use(express.json());

// IP Rate Limiting (applied to all /api routes)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
});
app.use('/api', apiLimiter);

// Serve uploads folder statically for document attachments
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/treatments', treatmentRoutes);

// Master CRM Bootstrap Route (Loads leads, patients, appointments, templates in one request)
app.get('/api/crm', protect, async (req, res, next) => {
  try {
    const supabase = require('./config/supabase');
    
    // Fetch all records in parallel
    const [leadsRes, patientsRes, appointmentsRes, templatesRes] = await Promise.all([
      supabase.from('leads').select('*').order('created_at', { ascending: false }),
      supabase.from('patients').select('*').order('created_at', { ascending: false }),
      supabase.from('appointments').select('*').order('date', { ascending: true }).order('time', { ascending: true }),
      supabase.from('templates').select('*'),
    ]);

    if (leadsRes.error) throw leadsRes.error;
    if (patientsRes.error) throw patientsRes.error;
    if (appointmentsRes.error) throw appointmentsRes.error;
    if (templatesRes.error) throw templatesRes.error;

    res.status(200).json({
      success: true,
      leads: leadsRes.data || [],
      patients: patientsRes.data || [],
      appointments: appointmentsRes.data || [],
      templates: templatesRes.data || [],
    });
  } catch (err) {
    next(err);
  }
});

// Serve frontend build statically (served at /Dr)
const publicPath = path.join(__dirname, 'public/Dr');
app.use('/Dr', express.static(publicPath));

// catch-all route for /Dr sub-pages to support Single Page Application (SPA) reloads
app.get('/Dr/*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).send('Frontend static files not compiled yet. Build the React project first.');
    }
  });
});

// Centralized Error Handling Middleware (must be registered last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Verdant CRM API server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
