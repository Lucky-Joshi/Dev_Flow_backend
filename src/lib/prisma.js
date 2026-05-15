const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { PrismaClient } = require('@prisma/client');

const url = process.env.DATABASE_URL || '';
const poolUrl = url.includes('?')
  ? `${url}&connection_limit=3&pool_timeout=15&pgbouncer=true`
  : `${url}?connection_limit=3&pool_timeout=15&pgbouncer=true`;

const prisma = new PrismaClient({
  datasources: { db: { url: poolUrl } },
});

module.exports = prisma;
