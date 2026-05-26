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

  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.table.deleteMany();

  const cat = await prisma.category.create({ data: { name: 'Indian' } });
  const item = await prisma.menuItem.create({
    data: { name: 'Biryani', price: 350, categoryId: cat.id, isAvailable: true },
  });
  const table = await prisma.table.create({
    data: { tableNumber: 'P1', capacity: 4, status: 'AVAILABLE' },
  });

  // Create an order and walk it to SERVED status
  const order = await prisma.order.create({
    data: {
      tableId: table.id,
      subtotal: 700,
      status: 'SERVED',
      orderItems: {
        create: [{ menuItemId: item.id, quantity: 2, unitPrice: 350, lineTotal: 700 }],
      },
    },
  });

  // Create a second OPEN order (should not accept payment)
  const openOrder = await prisma.order.create({
    data: {
      tableId: table.id,
      subtotal: 350,
      status: 'OPEN',
      orderItems: {
        create: [{ menuItemId: item.id, quantity: 1, unitPrice: 350, lineTotal: 350 }],
      },
    },
  });

  await prisma.$disconnect();
  return { item, table, order, openOrder };
}

async function run() {
  console.log('⏳ Seeding...');
  const { item, table, order, openOrder } = await seed();
  console.log('✅ Seed complete.\n');

  // ─── 1. Login ───────────────────────────────────────────────────────────────
  console.log('=== 1. LOGIN ===');
  let r = await req(`${baseUrl}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@restaurantos.local', password: 'Admin@12345' }),
  });
  const token = r.body.accessToken;
  const hdrs = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  console.log(`Status: ${r.status} – Login OK`);

  // ─── 2. Payment for OPEN order (expect 400) ────────────────────────────────
  console.log('\n=== 2. PAYMENT ON OPEN ORDER (expect 400) ===');
  r = await req(`${baseUrl}/payments`, { method: 'POST', headers: hdrs,
    body: JSON.stringify({ orderId: openOrder.id, amount: 350, paymentMethod: 'CASH' }) });
  console.log(`Status: ${r.status} – message: ${r.body.message}`);

  // ─── 3. Wrong amount (expect 400) ──────────────────────────────────────────
  console.log('\n=== 3. WRONG AMOUNT (expect 400) ===');
  r = await req(`${baseUrl}/payments`, { method: 'POST', headers: hdrs,
    body: JSON.stringify({ orderId: order.id, amount: 500, paymentMethod: 'CASH' }) });
  console.log(`Status: ${r.status} – message: ${r.body.message}`);

  // ─── 4. Invalid order (expect 404) ─────────────────────────────────────────
  console.log('\n=== 4. INVALID ORDER (expect 404) ===');
  r = await req(`${baseUrl}/payments`, { method: 'POST', headers: hdrs,
    body: JSON.stringify({ orderId: '00000000-0000-4000-a000-000000000000', amount: 100, paymentMethod: 'CASH' }) });
  console.log(`Status: ${r.status} – message: ${r.body.message}`);

  // ─── 5. Valid payment (CASH) ───────────────────────────────────────────────
  console.log('\n=== 5. VALID PAYMENT ===');
  r = await req(`${baseUrl}/payments`, { method: 'POST', headers: hdrs,
    body: JSON.stringify({ orderId: order.id, amount: 700, paymentMethod: 'CASH', transactionReference: 'CASH-001' }) });
  console.log(`Status: ${r.status}`);
  console.log(`  paymentStatus: ${r.body.paymentStatus}`);
  console.log(`  paidAt: ${r.body.paidAt}`);
  console.log(`  amount: ${r.body.amount}`);
  const paymentId = r.body.id;

  // ─── 6. Duplicate payment (expect 409) ─────────────────────────────────────
  console.log('\n=== 6. DUPLICATE PAYMENT (expect 409) ===');
  r = await req(`${baseUrl}/payments`, { method: 'POST', headers: hdrs,
    body: JSON.stringify({ orderId: order.id, amount: 700, paymentMethod: 'UPI' }) });
  console.log(`Status: ${r.status} – message: ${r.body.message}`);

  // ─── 7. Get all payments ───────────────────────────────────────────────────
  console.log('\n=== 7. GET ALL PAYMENTS ===');
  r = await req(`${baseUrl}/payments`, { headers: hdrs });
  console.log(`Status: ${r.status} – count: ${r.body.length}`);

  // ─── 8. Get payment by ID ─────────────────────────────────────────────────
  console.log('\n=== 8. GET PAYMENT BY ID ===');
  r = await req(`${baseUrl}/payments/${paymentId}`, { headers: hdrs });
  console.log(`Status: ${r.status} – paymentMethod: ${r.body.paymentMethod}`);

  // ─── 9. Get payment by order ──────────────────────────────────────────────
  console.log('\n=== 9. GET PAYMENT BY ORDER ===');
  r = await req(`${baseUrl}/orders/${order.id}/payment`, { headers: hdrs });
  console.log(`Status: ${r.status} – paymentId: ${r.body.id}`);

  // ─── 10. Receipt ──────────────────────────────────────────────────────────
  console.log('\n=== 10. RECEIPT ===');
  r = await req(`${baseUrl}/payments/${paymentId}/receipt`, { headers: hdrs });
  console.log(`Status: ${r.status}`);
  console.log(`  tableNumber: ${r.body.tableNumber}`);
  console.log(`  items: ${r.body.items?.length}`);
  console.log(`  subtotal: ${r.body.subtotal}`);
  console.log(`  paymentMethod: ${r.body.paymentMethod}`);
  console.log(`  paidAt: ${r.body.paidAt}`);

  // ─── 11. Refund ───────────────────────────────────────────────────────────
  console.log('\n=== 11. REFUND ===');
  r = await req(`${baseUrl}/payments/${paymentId}/refund`, { method: 'POST', headers: hdrs });
  console.log(`Status: ${r.status} – paymentStatus: ${r.body.paymentStatus}`);

  // ─── 12. Double refund (expect 422) ────────────────────────────────────────
  console.log('\n=== 12. DOUBLE REFUND (expect 422) ===');
  r = await req(`${baseUrl}/payments/${paymentId}/refund`, { method: 'POST', headers: hdrs });
  console.log(`Status: ${r.status} – message: ${r.body.message}`);

  // ─── 13. Unauthenticated (expect 401) ──────────────────────────────────────
  console.log('\n=== 13. UNAUTHENTICATED (expect 401) ===');
  r = await req(`${baseUrl}/payments`, {});
  console.log(`Status: ${r.status}`);

  // ─── 14. 404 on unknown payment ────────────────────────────────────────────
  console.log('\n=== 14. UNKNOWN PAYMENT (expect 404) ===');
  r = await req(`${baseUrl}/payments/00000000-0000-4000-a000-000000000000`, { headers: hdrs });
  console.log(`Status: ${r.status} – message: ${r.body.message}`);

  console.log('\n✅ All Payment integration tests complete.');
}

run().catch(console.error);
