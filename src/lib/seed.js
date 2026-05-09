const prisma = require('./prisma');

const ADMIN_ID = 'admin';

// Ensures the single admin user row exists in the DB.
// Called once on server startup.
async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@devflow.local';
  const name  = process.env.ADMIN_NAME  || 'Admin';

  await prisma.user.upsert({
    where:  { id: ADMIN_ID },
    update: { email, name },
    create: { id: ADMIN_ID, email, name },
  });
}

module.exports = { seedAdmin, ADMIN_ID };
