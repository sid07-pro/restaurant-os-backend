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

// ─── Seed helpers ────────────────────────────────────────────────────────────
async function seed() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  // Clean orders first (cascade deletes order items)
  await prisma.order.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.table.deleteMany();

  const cat = await prisma.category.create({ data: { name: 'Main Course' } });
  const item1 = await prisma.menuItem.create({
    data: { name: 'Butter Chicken', price: 300, categoryId: cat.id, isAvailable: true }
  });
  const item2 = await prisma.menuItem.create({
    data: { name: 'Dal Tadka', price: 180, categoryId: cat.id, isAvailable: true }
  });
  const unavailableItem = await prisma.menuItem.create({
    data: { name: 'Seasonal Special', price: 500, categoryId: cat.id, isAvailable: false }
  });
  const table = await prisma.table.create({
    data: { tableNumber: 'T01', capacity: 4, status: 'AVAILABLE' }
  });
  const outOfServiceTable = await prisma.table.create({
    data: { tableNumber: 'T99', capacity: 2, status: 'OUT_OF_SERVICE' }
  });

  await prisma.$disconnect();
  return { cat, item1, item2, unavailableItem, table, outOfServiceTable };
}

async function run() {
  console.log('⏳ Seeding test data...');
  const { item1, item2, unavailableItem, table, outOfServiceTable } = await seed();
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

  // ─── 2. Create Order (single item) ──────────────────────────────────────────
  console.log('\n=== 2. CREATE ORDER (1 item) ===');
  r = await req(`${baseUrl}/orders`, { method: 'POST', headers: hdrs,
    body: JSON.stringify({
      tableId: table.id,
      items: [{ menuItemId: item1.id, quantity: 2 }],
      notes: 'No spicy'
    })
  });
  console.log(`Status: ${r.status}`);
  console.log(`  subtotal: ${r.body.subtotal} (expected: ${300 * 2})`);
  console.log(`  status: ${r.body.status}`);
  console.log(`  items: ${r.body.orderItems?.length}`);
  const orderId = r.body.id;

  // ─── 3. Create Order (multiple items) ────────────────────────────────────────
  console.log('\n=== 3. CREATE ORDER (multiple items) ===');
  r = await req(`${baseUrl}/orders`, { method: 'POST', headers: hdrs,
    body: JSON.stringify({
      tableId: table.id,
      items: [
        { menuItemId: item1.id, quantity: 1 },
        { menuItemId: item2.id, quantity: 2 },
      ]
    })
  });
  const expectedSubtotal = 300 * 1 + 180 * 2;
  console.log(`Status: ${r.status}`);
  console.log(`  subtotal: ${r.body.subtotal} (expected: ${expectedSubtotal})`);
  console.log(`  item count: ${r.body.orderItems?.length} (expected: 2)`);
  const order2Id = r.body.id;

  // ─── 4. Invalid table ────────────────────────────────────────────────────────
  console.log('\n=== 4. INVALID TABLE (expect 404) ===');
  r = await req(`${baseUrl}/orders`, { method: 'POST', headers: hdrs,
    body: JSON.stringify({ tableId: '00000000-0000-0000-0000-000000000000', items: [{ menuItemId: item1.id, quantity: 1 }] })
  });
  console.log(`Status: ${r.status} – message: ${r.body.message}`);

  // ─── 5. OUT_OF_SERVICE table ──────────────────────────────────────────────────
  console.log('\n=== 5. OUT_OF_SERVICE TABLE (expect 400) ===');
  r = await req(`${baseUrl}/orders`, { method: 'POST', headers: hdrs,
    body: JSON.stringify({ tableId: outOfServiceTable.id, items: [{ menuItemId: item1.id, quantity: 1 }] })
  });
  console.log(`Status: ${r.status} – message: ${r.body.message}`);

  // ─── 6. Invalid menu item ──────────────────────────────────────────────────────
  console.log('\n=== 6. INVALID MENU ITEM (expect 400) ===');
  r = await req(`${baseUrl}/orders`, { method: 'POST', headers: hdrs,
    body: JSON.stringify({ tableId: table.id, items: [{ menuItemId: '00000000-0000-0000-0000-000000000000', quantity: 1 }] })
  });
  console.log(`Status: ${r.status} – message: ${r.body.message}`);

  // ─── 7. Unavailable menu item ─────────────────────────────────────────────────
  console.log('\n=== 7. UNAVAILABLE ITEM (expect 400) ===');
  r = await req(`${baseUrl}/orders`, { method: 'POST', headers: hdrs,
    body: JSON.stringify({ tableId: table.id, items: [{ menuItemId: unavailableItem.id, quantity: 1 }] })
  });
  console.log(`Status: ${r.status} – message: ${r.body.message}`);

  // ─── 8. Quantity < 1 ─────────────────────────────────────────────────────────
  console.log('\n=== 8. INVALID QUANTITY (expect 400) ===');
  r = await req(`${baseUrl}/orders`, { method: 'POST', headers: hdrs,
    body: JSON.stringify({ tableId: table.id, items: [{ menuItemId: item1.id, quantity: 0 }] })
  });
  console.log(`Status: ${r.status} – message: ${JSON.stringify(r.body.message)}`);

  // ─── 9. Get all orders ────────────────────────────────────────────────────────
  console.log('\n=== 9. GET ALL ORDERS ===');
  r = await req(`${baseUrl}/orders`, { headers: hdrs });
  console.log(`Status: ${r.status} – Count: ${r.body.length}`);

  // ─── 10. Get order by ID ─────────────────────────────────────────────────────
  console.log('\n=== 10. GET ORDER BY ID ===');
  r = await req(`${baseUrl}/orders/${orderId}`, { headers: hdrs });
  console.log(`Status: ${r.status} – id: ${r.body.id}`);

  // ─── 11. Get orders by table ─────────────────────────────────────────────────
  console.log('\n=== 11. GET ORDERS BY TABLE ===');
  r = await req(`${baseUrl}/orders/table/${table.id}`, { headers: hdrs });
  console.log(`Status: ${r.status} – Count: ${r.body.length}`);

  // ─── 12. Status transition: OPEN → SENT_TO_KITCHEN ──────────────────────────
  console.log('\n=== 12. STATUS: OPEN → SENT_TO_KITCHEN ===');
  r = await req(`${baseUrl}/orders/${orderId}/status`, { method: 'PATCH', headers: hdrs,
    body: JSON.stringify({ status: 'SENT_TO_KITCHEN' }) });
  console.log(`Status: ${r.status} – order status: ${r.body.status}`);

  // ─── 13. Status transition: SENT_TO_KITCHEN → PREPARING ─────────────────────
  console.log('\n=== 13. STATUS: SENT_TO_KITCHEN → PREPARING ===');
  r = await req(`${baseUrl}/orders/${orderId}/status`, { method: 'PATCH', headers: hdrs,
    body: JSON.stringify({ status: 'PREPARING' }) });
  console.log(`Status: ${r.status} – order status: ${r.body.status}`);

  // ─── 14. Invalid transition (PREPARING → COMPLETED, skipping READY/SERVED) ───
  console.log('\n=== 14. INVALID TRANSITION: PREPARING → COMPLETED (expect 422) ===');
  r = await req(`${baseUrl}/orders/${orderId}/status`, { method: 'PATCH', headers: hdrs,
    body: JSON.stringify({ status: 'COMPLETED' }) });
  console.log(`Status: ${r.status} – message: ${r.body.message}`);

  // ─── 15. Cancellation from PREPARING ────────────────────────────────────────
  console.log('\n=== 15. CANCEL ORDER (from PREPARING) ===');
  r = await req(`${baseUrl}/orders/${orderId}/status`, { method: 'PATCH', headers: hdrs,
    body: JSON.stringify({ status: 'CANCELLED' }) });
  console.log(`Status: ${r.status} – order status: ${r.body.status}`);

  // ─── 16. Transition from CANCELLED (expect 422) ──────────────────────────────
  console.log('\n=== 16. TRANSITION FROM CANCELLED (expect 422) ===');
  r = await req(`${baseUrl}/orders/${orderId}/status`, { method: 'PATCH', headers: hdrs,
    body: JSON.stringify({ status: 'OPEN' }) });
  console.log(`Status: ${r.status} – message: ${r.body.message}`);

  // ─── 17. Full happy path: OPEN → SERVED → COMPLETED on order2 ───────────────
  console.log('\n=== 17. FULL STATUS CHAIN (order2) ===');
  for (const s of ['SENT_TO_KITCHEN', 'PREPARING', 'READY', 'SERVED', 'COMPLETED']) {
    r = await req(`${baseUrl}/orders/${order2Id}/status`, { method: 'PATCH', headers: hdrs,
      body: JSON.stringify({ status: s }) });
    console.log(`  → ${s}: HTTP ${r.status}`);
  }

  // ─── 18. Delete COMPLETED order (expect 400) ─────────────────────────────────
  console.log('\n=== 18. DELETE COMPLETED ORDER (expect 400) ===');
  r = await req(`${baseUrl}/orders/${order2Id}`, { method: 'DELETE', headers: hdrs });
  console.log(`Status: ${r.status} – message: ${r.body.message}`);

  // ─── 19. Unauthenticated (expect 401) ────────────────────────────────────────
  console.log('\n=== 19. UNAUTHENTICATED (expect 401) ===');
  r = await req(`${baseUrl}/orders`, {});
  console.log(`Status: ${r.status}`);

  // ─── 20. 404 on unknown order ────────────────────────────────────────────────
  console.log('\n=== 20. GET UNKNOWN ORDER (expect 404) ===');
  r = await req(`${baseUrl}/orders/00000000-0000-0000-0000-000000000000`, { headers: hdrs });
  console.log(`Status: ${r.status} – message: ${r.body.message}`);

  console.log('\n✅ All integration tests complete.');
}

run().catch(console.error);
