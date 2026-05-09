const prisma = require('./prisma');

const ADMIN_ID = 'admin';

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL || 'admin@devflow.local';
  const name  = process.env.ADMIN_NAME  || 'Admin';

  try {
    await prisma.user.upsert({
      where:  { id: ADMIN_ID },
      update: { email, name },
      create: { id: ADMIN_ID, email, name },
    });
    console.log(`✓ Admin user seeded (id: ${ADMIN_ID}, email: ${email})`);
  } catch (err) {
    console.error('✗ Seed failed:', err.message);
    throw err;
  }
}

module.exports = { seedAdmin, ADMIN_ID };
