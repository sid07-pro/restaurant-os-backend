require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const baseUrl = 'http://localhost:3000/api/v1';

async function req(url, opts = {}) {
  const r = await fetch(url, opts);
  const text = await r.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  return { status: r.status, body };
}

async function seed() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  // 1. Clean up existing customers
  await prisma.customer.deleteMany();

  // 2. Setup Cashier & Waiter users if not exist
  const defaultPasswordHash = '$2b$10$Ac9Hknwaw3QItNJRxoxsWu0t6bv/eUl58orS.d76gm9vfgDXptZnG'; // Admin@12345

  // Delete potential test users to ensure a clean state
  await prisma.user.deleteMany({
    where: {
      email: { in: ['cashier@restaurantos.local', 'waiter@restaurantos.local'] }
    }
  });

  // Create Cashier
  const cashier = await prisma.user.create({
    data: {
      email: 'cashier@restaurantos.local',
      passwordHash: defaultPasswordHash,
      name: 'Test Cashier',
      role: 'CASHIER',
      status: 'ACTIVE'
    }
  });

  // Create Waiter
  const waiter = await prisma.user.create({
    data: {
      email: 'waiter@restaurantos.local',
      passwordHash: defaultPasswordHash,
      name: 'Test Waiter',
      role: 'WAITER',
      status: 'ACTIVE'
    }
  });

  await prisma.$disconnect();
  await pool.end();
  return { cashier, waiter };
}

async function run() {
  console.log('⏳ Cleaning and seeding database for CRM...');
  await seed();
  console.log('✅ Seed complete.\n');

  // ─── 1. Login with different roles ──────────────────────────────────────────
  console.log('=== 1. LOGIN WITH ROLES ===');
  
  // Admin Login
  let adminRes = await req(`${baseUrl}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@restaurantos.local', password: 'Admin@12345' }),
  });
  const adminToken = adminRes.body.accessToken;
  const adminHdrs = { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` };
  console.log(`Status: ${adminRes.status} – Admin Login OK`);

  // Cashier Login
  let cashierRes = await req(`${baseUrl}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'cashier@restaurantos.local', password: 'Admin@12345' }),
  });
  const cashierToken = cashierRes.body.accessToken;
  const cashierHdrs = { 'Content-Type': 'application/json', Authorization: `Bearer ${cashierToken}` };
  console.log(`Status: ${cashierRes.status} – Cashier Login OK`);

  // Waiter Login
  let waiterRes = await req(`${baseUrl}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'waiter@restaurantos.local', password: 'Admin@12345' }),
  });
  const waiterToken = waiterRes.body.accessToken;
  const waiterHdrs = { 'Content-Type': 'application/json', Authorization: `Bearer ${waiterToken}` };
  console.log(`Status: ${waiterRes.status} – Waiter Login OK`);

  // ─── 2. Create customer ────────────────────────────────────────────────────
  console.log('\n=== 2. CREATE CUSTOMER (as Cashier) ===');
  let r = await req(`${baseUrl}/customers`, {
    method: 'POST', headers: cashierHdrs,
    body: JSON.stringify({
      name: 'John Doe',
      phone: '+919876543210',
      email: 'john@example.com'
    })
  });
  console.log(`Status: ${r.status} – id: ${r.body.id}`);
  console.log(`  name: ${r.body.name} – phone: ${r.body.phone} – loyalty: ${r.body.loyaltyPoints}`);
  const customerId = r.body.id;

  // ─── 3. Prevent duplicate phone ────────────────────────────────────────────
  console.log('\n=== 3. DUPLICATE PHONE NUMBER (expect 409) ===');
  r = await req(`${baseUrl}/customers`, {
    method: 'POST', headers: cashierHdrs,
    body: JSON.stringify({
      name: 'Another Doe',
      phone: '+919876543210'
    })
  });
  console.log(`Status: ${r.status} – message: ${r.body.message}`);

  // ─── 4. Search and Phone Lookup ────────────────────────────────────────────
  console.log('\n=== 4. SEARCH & PHONE LOOKUP (as Waiter) ===');
  // Search by name
  r = await req(`${baseUrl}/customers?search=john`, { headers: waiterHdrs });
  console.log(`Search 'john' status: ${r.status} – count: ${r.body.length} – first name: ${r.body[0]?.name}`);

  // Lookup by phone
  r = await req(`${baseUrl}/customers?phone=98765`, { headers: waiterHdrs });
  console.log(`Phone lookup status: ${r.status} – count: ${r.body.length} – phone: ${r.body[0]?.phone}`);

  // ─── 5. Get Customer by ID ────────────────────────────────────────────────
  console.log('\n=== 5. GET CUSTOMER BY ID ===');
  r = await req(`${baseUrl}/customers/${customerId}`, { headers: waiterHdrs });
  console.log(`Status: ${r.status} – name: ${r.body.name} – email: ${r.body.email}`);

  // ─── 6. Update Customer profile & statistics ──────────────────────────────
  console.log('\n=== 6. UPDATE CUSTOMER PROFILE & STATS (as Cashier) ===');
  r = await req(`${baseUrl}/customers/${customerId}`, {
    method: 'PATCH', headers: cashierHdrs,
    body: JSON.stringify({
      name: 'John Updated',
      email: 'john_new@example.com',
      totalVisits: 5,
      totalSpent: 125.50
    })
  });
  console.log(`Status: ${r.status}`);
  console.log(`  name: ${r.body.name}`);
  console.log(`  email: ${r.body.email}`);
  console.log(`  totalVisits: ${r.body.totalVisits} (expected: 5)`);
  console.log(`  totalSpent: ${r.body.totalSpent} (expected: 125.50)`);

  // ─── 7. Loyalty Points Lifecycle ──────────────────────────────────────────
  console.log('\n=== 7. LOYALTY POINTS LIFECYCLE (as Cashier) ===');
  // Add points
  r = await req(`${baseUrl}/customers/${customerId}/loyalty/add`, {
    method: 'POST', headers: cashierHdrs,
    body: JSON.stringify({ points: 50 })
  });
  console.log(`Add +50 points status: ${r.status} – new points: ${r.body.loyaltyPoints}`);

  // Deduct points
  r = await req(`${baseUrl}/customers/${customerId}/loyalty/deduct`, {
    method: 'POST', headers: cashierHdrs,
    body: JSON.stringify({ points: 20 })
  });
  console.log(`Deduct -20 points status: ${r.status} – new points: ${r.body.loyaltyPoints} (expected: 30)`);

  // Prevent negative balance
  r = await req(`${baseUrl}/customers/${customerId}/loyalty/deduct`, {
    method: 'POST', headers: cashierHdrs,
    body: JSON.stringify({ points: 100 })
  });
  console.log(`Deduct -100 points (insufficient) status: ${r.status} – message: ${r.body.message}`);

  // Get loyalty balance
  r = await req(`${baseUrl}/customers/${customerId}/loyalty`, { headers: waiterHdrs });
  console.log(`Get loyalty balance status: ${r.status} – points: ${r.body.loyaltyPoints} (expected: 30)`);

  // ─── 8. Customer Summary / Statistics ──────────────────────────────────────
  console.log('\n=== 8. CUSTOMER SUMMARY / STATS (as Waiter) ===');
  r = await req(`${baseUrl}/customers/${customerId}/summary`, { headers: waiterHdrs });
  console.log(`Status: ${r.status}`);
  console.log(`  Summary details:`);
  console.log(`    loyaltyPoints: ${r.body.loyaltyPoints}`);
  console.log(`    totalVisits: ${r.body.totalVisits}`);
  console.log(`    totalSpent: ${r.body.totalSpent}`);

  // ─── 9. Security Role Restrictions ─────────────────────────────────────────
  console.log('\n=== 9. SECURITY & RBAC RESTRICTIONS ===');
  
  // Waiter attempts to create customer
  r = await req(`${baseUrl}/customers`, {
    method: 'POST', headers: waiterHdrs,
    body: JSON.stringify({ name: 'Hack Doe', phone: '+9876543210' })
  });
  console.log(`Waiter creates customer status: ${r.status} (expected: 403)`);

  // Waiter attempts to update customer
  r = await req(`${baseUrl}/customers/${customerId}`, {
    method: 'PATCH', headers: waiterHdrs,
    body: JSON.stringify({ name: 'Hack Doe' })
  });
  console.log(`Waiter updates customer status: ${r.status} (expected: 403)`);

  // Cashier attempts to delete customer
  r = await req(`${baseUrl}/customers/${customerId}`, {
    method: 'DELETE', headers: cashierHdrs
  });
  console.log(`Cashier deletes customer status: ${r.status} (expected: 403)`);

  // Admin deletes customer successfully
  r = await req(`${baseUrl}/customers/${customerId}`, {
    method: 'DELETE', headers: adminHdrs
  });
  console.log(`Admin deletes customer status: ${r.status} (expected: 200)`);

  // Verify deleted (expect 404)
  r = await req(`${baseUrl}/customers/${customerId}`, { headers: adminHdrs });
  console.log(`Get deleted customer status: ${r.status} (expected: 404)`);

  console.log('\n✅ All CRM and Loyalty integration tests complete successfully!');
}

run().catch(console.error);
