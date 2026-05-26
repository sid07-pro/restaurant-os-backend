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
  await prisma.order.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.table.deleteMany();

  const cat = await prisma.category.create({ data: { name: 'Grills' } });
  const item = await prisma.menuItem.create({
    data: { name: 'Chicken Wings', price: 220, categoryId: cat.id, isAvailable: true },
  });
  const table = await prisma.table.create({
    data: { tableNumber: 'T10', capacity: 4, status: 'AVAILABLE' },
  });
  await prisma.$disconnect();
  return { item, table };
}

async function login(hdrs) {
  const r = await req(`${baseUrl}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@restaurantos.local', password: 'Admin@12345' }),
  });
  return `Bearer ${r.body.accessToken}`;
}

async function run() {
  console.log('⏳ Seeding...');
  const { item, table } = await seed();
  console.log('✅ Seed complete.\n');

  const adminToken = await login();
  const adminHdrs = { 'Content-Type': 'application/json', Authorization: adminToken };

  // ─── 1. Create an order then advance to SENT_TO_KITCHEN ───────────────────
  console.log('=== 1. SETUP: Create order + send to kitchen ===');
  let r = await req(`${baseUrl}/orders`, { method: 'POST', headers: adminHdrs,
    body: JSON.stringify({ tableId: table.id, items: [{ menuItemId: item.id, quantity: 3 }] }),
  });
  const orderId = r.body.id;
  console.log(`  Create order: ${r.status} – id: ${orderId}`);

  r = await req(`${baseUrl}/orders/${orderId}/status`, { method: 'PATCH', headers: adminHdrs,
    body: JSON.stringify({ status: 'SENT_TO_KITCHEN' }) });
  console.log(`  → SENT_TO_KITCHEN: ${r.status}`);

  // ─── 2. GET active tickets (should include our order) ─────────────────────
  console.log('\n=== 2. GET ACTIVE TICKETS ===');
  r = await req(`${baseUrl}/kds/tickets`, { headers: adminHdrs });
  console.log(`Status: ${r.status} – count: ${r.body.length}`);
  const ticket = r.body.find(t => t.id === orderId);
  console.log(`  Found our order: ${!!ticket} – priority: ${ticket?.priority} – preparationStartedAt: ${ticket?.preparationStartedAt}`);

  // ─── 3. GET single ticket ─────────────────────────────────────────────────
  console.log('\n=== 3. GET SINGLE TICKET ===');
  r = await req(`${baseUrl}/kds/tickets/${orderId}`, { headers: adminHdrs });
  console.log(`Status: ${r.status} – status: ${r.body.status} – preparationDurationSeconds: ${r.body.preparationDurationSeconds}`);

  // ─── 4. Set priority flag ─────────────────────────────────────────────────
  console.log('\n=== 4. SET PRIORITY = true ===');
  r = await req(`${baseUrl}/kds/tickets/${orderId}/priority`, { method: 'PATCH', headers: adminHdrs,
    body: JSON.stringify({ priority: true }) });
  console.log(`Status: ${r.status} – priority: ${r.body.priority}`);

  // ─── 5. Update kitchen notes ──────────────────────────────────────────────
  console.log('\n=== 5. UPDATE KITCHEN NOTES ===');
  r = await req(`${baseUrl}/kds/tickets/${orderId}/notes`, { method: 'PATCH', headers: adminHdrs,
    body: JSON.stringify({ kitchenNotes: 'Extra crispy, no sauce' }) });
  console.log(`Status: ${r.status} – kitchenNotes: ${r.body.kitchenNotes}`);

  // ─── 6. Start preparing (SENT_TO_KITCHEN → PREPARING) ────────────────────
  console.log('\n=== 6. START PREPARING ===');
  r = await req(`${baseUrl}/kds/tickets/${orderId}/start`, { method: 'PATCH', headers: adminHdrs });
  console.log(`Status: ${r.status} – status: ${r.body.status} – preparationStartedAt: ${r.body.preparationStartedAt}`);

  // ─── 7. Verify prep duration is being calculated ──────────────────────────
  console.log('\n=== 7. PREP DURATION WHILE PREPARING ===');
  r = await req(`${baseUrl}/kds/tickets/${orderId}`, { headers: adminHdrs });
  console.log(`Status: ${r.status} – preparationDurationSeconds: ${r.body.preparationDurationSeconds} (>= 0: ${r.body.preparationDurationSeconds >= 0})`);

  // ─── 8. Invalid: START again (already PREPARING, expect 422) ─────────────
  console.log('\n=== 8. START AGAIN WHILE PREPARING (expect 422) ===');
  r = await req(`${baseUrl}/kds/tickets/${orderId}/start`, { method: 'PATCH', headers: adminHdrs });
  console.log(`Status: ${r.status} – message: ${r.body.message}`);

  // ─── 9. Mark ready (PREPARING → READY) ───────────────────────────────────
  console.log('\n=== 9. MARK READY ===');
  r = await req(`${baseUrl}/kds/tickets/${orderId}/ready`, { method: 'PATCH', headers: adminHdrs });
  console.log(`Status: ${r.status} – status: ${r.body.status} – readyAt: ${r.body.readyAt}`);

  // ─── 10. Verify prep duration locked at readyAt ───────────────────────────
  console.log('\n=== 10. PREP DURATION AFTER READY (uses readyAt) ===');
  r = await req(`${baseUrl}/kds/tickets/${orderId}`, { headers: adminHdrs });
  console.log(`Status: ${r.status} – preparationDurationSeconds: ${r.body.preparationDurationSeconds}`);

  // ─── 11. Invalid: Mark ready again (already READY, expect 422) ───────────
  console.log('\n=== 11. MARK READY AGAIN (expect 422) ===');
  r = await req(`${baseUrl}/kds/tickets/${orderId}/ready`, { method: 'PATCH', headers: adminHdrs });
  console.log(`Status: ${r.status} – message: ${r.body.message}`);

  // ─── 12. Mark served (READY → SERVED) ────────────────────────────────────
  console.log('\n=== 12. MARK SERVED ===');
  r = await req(`${baseUrl}/kds/tickets/${orderId}/serve`, { method: 'PATCH', headers: adminHdrs });
  console.log(`Status: ${r.status} – status: ${r.body.status} – servedAt: ${r.body.servedAt}`);

  // ─── 13. Active tickets should no longer include SERVED order ─────────────
  console.log('\n=== 13. ACTIVE TICKETS AFTER SERVE (should not include SERVED) ===');
  r = await req(`${baseUrl}/kds/tickets`, { headers: adminHdrs });
  const stillActive = r.body.find(t => t.id === orderId);
  console.log(`Status: ${r.status} – count: ${r.body.length} – SERVED order in active: ${!!stillActive}`);

  // ─── 14. Mark served again (already SERVED, expect 422) ──────────────────
  console.log('\n=== 14. MARK SERVED AGAIN (expect 422) ===');
  r = await req(`${baseUrl}/kds/tickets/${orderId}/serve`, { method: 'PATCH', headers: adminHdrs });
  console.log(`Status: ${r.status} – message: ${r.body.message}`);

  // ─── 15. Priority ordering: create low-priority then high-priority order ──
  console.log('\n=== 15. PRIORITY ORDERING ===');
  // Order A — normal priority
  let rA = await req(`${baseUrl}/orders`, { method: 'POST', headers: adminHdrs,
    body: JSON.stringify({ tableId: table.id, items: [{ menuItemId: item.id, quantity: 1 }] }) });
  await req(`${baseUrl}/orders/${rA.body.id}/status`, { method: 'PATCH', headers: adminHdrs,
    body: JSON.stringify({ status: 'SENT_TO_KITCHEN' }) });
  // Order B — high priority
  let rB = await req(`${baseUrl}/orders`, { method: 'POST', headers: adminHdrs,
    body: JSON.stringify({ tableId: table.id, items: [{ menuItemId: item.id, quantity: 2 }] }) });
  await req(`${baseUrl}/orders/${rB.body.id}/status`, { method: 'PATCH', headers: adminHdrs,
    body: JSON.stringify({ status: 'SENT_TO_KITCHEN' }) });
  await req(`${baseUrl}/kds/tickets/${rB.body.id}/priority`, { method: 'PATCH', headers: adminHdrs,
    body: JSON.stringify({ priority: true }) });

  r = await req(`${baseUrl}/kds/tickets`, { headers: adminHdrs });
  console.log(`Status: ${r.status} – ticket order (priority desc): ${r.body.map(t => `${t.id.slice(0,8)}(priority=${t.priority})`).join(', ')}`);
  const firstTicketIsPriority = r.body[0]?.priority === true;
  console.log(`  First ticket is high-priority: ${firstTicketIsPriority}`);

  // ─── 16. Unauthenticated access (expect 401) ─────────────────────────────
  console.log('\n=== 16. UNAUTHENTICATED (expect 401) ===');
  r = await req(`${baseUrl}/kds/tickets`, {});
  console.log(`Status: ${r.status}`);

  // ─── 17. 404 on unknown order ─────────────────────────────────────────────
  console.log('\n=== 17. UNKNOWN ORDER (expect 404) ===');
  r = await req(`${baseUrl}/kds/tickets/00000000-0000-0000-0000-000000000000/start`, {
    method: 'PATCH', headers: adminHdrs });
  console.log(`Status: ${r.status} – message: ${r.body.message}`);

  console.log('\n✅ All KDS integration tests complete.');
}

run().catch(console.error);
