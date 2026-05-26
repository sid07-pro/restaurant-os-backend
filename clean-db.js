require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function clean() {
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.$disconnect();
  console.log('DB cleaned – all categories and menu items removed.');
}

clean().catch(console.error);
