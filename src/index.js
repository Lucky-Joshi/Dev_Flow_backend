require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { seedAdmin } = require('./lib/seed');

const authRoutes      = require('./routes/auth');
const projectRoutes   = require('./routes/projects');
const taskRoutes      = require('./routes/tasks');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

const allowedOrigins = [
  (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, ''),
  'http://localhost:5173',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin.replace(/\/$/, ''))) {
      return callback(null, true);
    }
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json());

app.get('/', (req, res) => res.send('DevFlow API Running 🚀'));
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Temporary: verify env vars are loaded on Render (remove after confirming)
app.get('/debug-auth', (req, res) => {
  res.json({
    ADMIN_EMAIL_SET: !!process.env.ADMIN_EMAIL,
    ADMIN_EMAIL_VALUE: process.env.ADMIN_EMAIL || 'NOT SET',
    ADMIN_PASSWORD_SET: !!process.env.ADMIN_PASSWORD,
    JWT_SECRET_SET: !!process.env.JWT_SECRET,
  });
});

app.use('/auth',      authRoutes);
app.use('/projects',  projectRoutes);
app.use('/tasks',     taskRoutes);
app.use('/dashboard', dashboardRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 3001;

seedAdmin()
  .then(() => app.listen(PORT, () => console.log(`DevFlow API running on port ${PORT}`)))
  .catch((err) => {
    console.error('Seed failed (non-fatal):', err.message);
    // Start server anyway — seed will retry on next deploy or can be run manually
    app.listen(PORT, () => console.log(`DevFlow API running on port ${PORT} (seed skipped)`));
  });
