// test-prisma.js
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

console.log('Instantiating PrismaClient with pg adapter...');
try {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  console.log('Successfully instantiated PrismaClient.');
  
  console.log('Calling $connect()...');
  prisma.$connect()
    .then(() => console.log('Successfully connected!'))
    .catch(err => {
      console.log('Captured $connect() error (resiliently caught):');
      console.error(err.message || err);
    });
} catch (err) {
  console.error('Error during instantiation:', err);
}
