require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { seedAdmin } = require('./lib/seed');

const authRoutes      = require('./routes/auth');
const projectRoutes   = require('./routes/projects');
const taskRoutes      = require('./routes/tasks');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

app.use(cors());
app.options('*', cors());
app.use(express.json());

app.get('/', (req, res) => res.send('DevFlow API Running 🚀'));
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.get('/debug-auth', (req, res) => {
  res.json({
    ADMIN_EMAIL_SET: !!process.env.ADMIN_EMAIL,
    ADMIN_EMAIL_VALUE: process.env.ADMIN_EMAIL || 'NOT SET',
    ADMIN_PASSWORD_SET: !!process.env.ADMIN_PASSWORD,
    JWT_SECRET_SET: !!process.env.JWT_SECRET,
  });
});

// Check if admin row exists in DB
app.get('/debug-db', async (req, res) => {
  const prisma = require('./lib/prisma');
  try {
    const user = await prisma.user.findUnique({ where: { id: 'admin' } });
    const projectCount = await prisma.project.count();
    res.json({ adminRowExists: !!user, adminRow: user, totalProjects: projectCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check raw DB URL (masked)
app.get('/debug-db-url', (req, res) => {
  const url = process.env.DATABASE_URL || 'NOT SET';
  const masked = url.replace(/:([^:@]+)@/, ':****@');
  res.json({ DATABASE_URL: masked, length: url.length });
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

async function startServer() {
  // Retry seed up to 3 times (handles cold DB connections on Render)
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await seedAdmin();
      break;
    } catch (err) {
      console.error(`Seed attempt ${attempt}/3 failed:`, err.message);
      if (attempt === 3) {
        console.error('All seed attempts failed — starting anyway, data may be missing');
      } else {
        await new Promise((r) => setTimeout(r, 2000 * attempt));
      }
    }
  }
  app.listen(PORT, () => console.log(`DevFlow API running on port ${PORT}`));
}

startServer();
