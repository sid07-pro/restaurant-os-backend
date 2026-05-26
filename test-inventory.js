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
  await prisma.stockMovement.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.$disconnect();
}

async function run() {
  console.log('⏳ Cleaning inventory data...');
  await seed();
  console.log('✅ Clean complete.\n');

  // ─── 1. Login ───────────────────────────────────────────────────────────────
  console.log('=== 1. LOGIN ===');
  let r = await req(`${baseUrl}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@restaurantos.local', password: 'Admin@12345' }),
  });
  const token = r.body.accessToken;
  const hdrs = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  console.log(`Status: ${r.status} – Login OK`);

  // ─── 2. Create inventory item ──────────────────────────────────────────────
  console.log('\n=== 2. CREATE INVENTORY ITEM ===');
  r = await req(`${baseUrl}/inventory`, { method: 'POST', headers: hdrs,
    body: JSON.stringify({
      name: 'Basmati Rice', sku: 'RICE-001', unit: 'kg',
      currentStock: 50, minimumStock: 10, costPrice: 120, supplierName: 'Rice Traders Co'
    }) });
  console.log(`Status: ${r.status} – id: ${r.body.id}`);
  console.log(`  sku: ${r.body.sku} – stock: ${r.body.currentStock} – isLowStock: ${r.body.isLowStock} – isOutOfStock: ${r.body.isOutOfStock}`);
  const itemId = r.body.id;

  // ─── 3. Duplicate SKU (expect 409) ─────────────────────────────────────────
  console.log('\n=== 3. DUPLICATE SKU (expect 409) ===');
  r = await req(`${baseUrl}/inventory`, { method: 'POST', headers: hdrs,
    body: JSON.stringify({ name: 'Another Rice', sku: 'RICE-001', unit: 'kg' }) });
  console.log(`Status: ${r.status} – message: ${r.body.message}`);

  // ─── 4. Create second item (zero stock) ───────────────────────────────────
  console.log('\n=== 4. CREATE ITEM WITH ZERO STOCK ===');
  r = await req(`${baseUrl}/inventory`, { method: 'POST', headers: hdrs,
    body: JSON.stringify({ name: 'Saffron', sku: 'SAFF-001', unit: 'g', minimumStock: 5 }) });
  console.log(`Status: ${r.status} – isOutOfStock: ${r.body.isOutOfStock} – isLowStock: ${r.body.isLowStock}`);
  const saffronId = r.body.id;

  // ─── 5. Get all items ──────────────────────────────────────────────────────
  console.log('\n=== 5. GET ALL ITEMS ===');
  r = await req(`${baseUrl}/inventory`, { headers: hdrs });
  console.log(`Status: ${r.status} – count: ${r.body.length}`);

  // ─── 6. Get item by ID ────────────────────────────────────────────────────
  console.log('\n=== 6. GET ITEM BY ID ===');
  r = await req(`${baseUrl}/inventory/${itemId}`, { headers: hdrs });
  console.log(`Status: ${r.status} – name: ${r.body.name} – sku: ${r.body.sku}`);

  // ─── 7. Update item ───────────────────────────────────────────────────────
  console.log('\n=== 7. UPDATE ITEM ===');
  r = await req(`${baseUrl}/inventory/${itemId}`, { method: 'PATCH', headers: hdrs,
    body: JSON.stringify({ costPrice: 130, supplierName: 'Premium Rice Ltd' }) });
  console.log(`Status: ${r.status} – costPrice: ${r.body.costPrice} – supplierName: ${r.body.supplierName}`);

  // ─── 8. Increase stock ────────────────────────────────────────────────────
  console.log('\n=== 8. INCREASE STOCK (+20) ===');
  r = await req(`${baseUrl}/inventory/${itemId}/adjust-stock`, { method: 'POST', headers: hdrs,
    body: JSON.stringify({ quantityChange: 20, reason: 'Purchase from supplier' }) });
  console.log(`Status: ${r.status} – currentStock: ${r.body.currentStock} (expected: 70)`);

  // ─── 9. Decrease stock ────────────────────────────────────────────────────
  console.log('\n=== 9. DECREASE STOCK (-60) ===');
  r = await req(`${baseUrl}/inventory/${itemId}/adjust-stock`, { method: 'POST', headers: hdrs,
    body: JSON.stringify({ quantityChange: -60, reason: 'Used in cooking' }) });
  console.log(`Status: ${r.status} – currentStock: ${r.body.currentStock} (expected: 10)`);
  console.log(`  isLowStock: ${r.body.isLowStock} (expected: true, since 10 <= 10)`);

  // ─── 10. Prevent negative stock ───────────────────────────────────────────
  console.log('\n=== 10. PREVENT NEGATIVE STOCK (expect 400) ===');
  r = await req(`${baseUrl}/inventory/${itemId}/adjust-stock`, { method: 'POST', headers: hdrs,
    body: JSON.stringify({ quantityChange: -20, reason: 'Excessive draw' }) });
  console.log(`Status: ${r.status} – message: ${r.body.message}`);

  // ─── 11. Drain to zero → out-of-stock ─────────────────────────────────────
  console.log('\n=== 11. DRAIN TO ZERO ===');
  r = await req(`${baseUrl}/inventory/${itemId}/adjust-stock`, { method: 'POST', headers: hdrs,
    body: JSON.stringify({ quantityChange: -10, reason: 'Fully consumed' }) });
  console.log(`Status: ${r.status} – currentStock: ${r.body.currentStock}`);
  console.log(`  isOutOfStock: ${r.body.isOutOfStock} (expected: true)`);
  console.log(`  isLowStock: ${r.body.isLowStock} (expected: false, since stock is 0)`);

  // ─── 12. Movement history ─────────────────────────────────────────────────
  console.log('\n=== 12. MOVEMENT HISTORY ===');
  r = await req(`${baseUrl}/inventory/${itemId}/movements`, { headers: hdrs });
  console.log(`Status: ${r.status} – movement count: ${r.body.length} (expected: 3)`);
  r.body.forEach((m, i) => console.log(`  [${i}] change: ${m.quantityChange} – reason: ${m.reason}`));

  // ─── 13. Delete item ──────────────────────────────────────────────────────
  console.log('\n=== 13. DELETE ITEM ===');
  r = await req(`${baseUrl}/inventory/${saffronId}`, { method: 'DELETE', headers: hdrs });
  console.log(`Status: ${r.status}`);

  // ─── 14. Verify deleted (expect 404) ──────────────────────────────────────
  console.log('\n=== 14. GET DELETED ITEM (expect 404) ===');
  r = await req(`${baseUrl}/inventory/${saffronId}`, { headers: hdrs });
  console.log(`Status: ${r.status} – message: ${r.body.message}`);

  // ─── 15. Unauthenticated (expect 401) ──────────────────────────────────────
  console.log('\n=== 15. UNAUTHENTICATED (expect 401) ===');
  r = await req(`${baseUrl}/inventory`, {});
  console.log(`Status: ${r.status}`);

  // ─── 16. Unknown item (expect 404) ─────────────────────────────────────────
  console.log('\n=== 16. UNKNOWN ITEM (expect 404) ===');
  r = await req(`${baseUrl}/inventory/00000000-0000-4000-a000-000000000000`, { headers: hdrs });
  console.log(`Status: ${r.status} – message: ${r.body.message}`);

  console.log('\n✅ All Inventory integration tests complete.');
}

run().catch(console.error);
