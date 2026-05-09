require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { seedAdmin } = require('./lib/seed');

const authRoutes      = require('./routes/auth');
const projectRoutes   = require('./routes/projects');
const taskRoutes      = require('./routes/tasks');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

app.get('/', (req, res) => res.send('DevFlow API Running 🚀'));
app.get('/health', (req, res) => res.json({ status: 'ok' }));

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
  .catch((err) => { console.error('Startup failed:', err); process.exit(1); });
