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

  // 1. Clean reservations, payments, order items, orders first (FK order)
  await prisma.reservation.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.inventoryItem.deleteMany();

  // 2. Upsert users
  const defaultPwHash = '$2b$10$Ac9Hknwaw3QItNJRxoxsWu0t6bv/eUl58orS.d76gm9vfgDXptZnG';
  await prisma.user.deleteMany({ where: { email: { in: ['cashier@restaurantos.local', 'waiter@restaurantos.local'] } } });
  await prisma.user.create({ data: { email: 'cashier@restaurantos.local', passwordHash: defaultPwHash, name: 'Cashier', role: 'CASHIER', status: 'ACTIVE' } });
  await prisma.user.create({ data: { email: 'waiter@restaurantos.local', passwordHash: defaultPwHash, name: 'Waiter', role: 'WAITER', status: 'ACTIVE' } });

  // 3. Upsert customers
  let cust1 = await prisma.customer.findUnique({ where: { phone: '+919876543210' } });
  if (!cust1) cust1 = await prisma.customer.create({ data: { name: 'John Doe', phone: '+919876543210', email: 'john@example.com', totalVisits: 10, totalSpent: 5000, loyaltyPoints: 100 } });
  else cust1 = await prisma.customer.update({ where: { id: cust1.id }, data: { totalVisits: 10, totalSpent: 5000, loyaltyPoints: 100 } });

  let cust2 = await prisma.customer.findUnique({ where: { phone: '+918765432109' } });
  if (!cust2) cust2 = await prisma.customer.create({ data: { name: 'Jane Smith', phone: '+918765432109', email: 'jane@example.com', totalVisits: 3, totalSpent: 1500, loyaltyPoints: 30 } });
  else cust2 = await prisma.customer.update({ where: { id: cust2.id }, data: { totalVisits: 3, totalSpent: 1500, loyaltyPoints: 30 } });

  // 4. Upsert tables
  let table1 = await prisma.table.findUnique({ where: { tableNumber: 'T1' } });
  if (!table1) table1 = await prisma.table.create({ data: { tableNumber: 'T1', capacity: 4, status: 'AVAILABLE' } });
  else table1 = await prisma.table.update({ where: { id: table1.id }, data: { status: 'AVAILABLE' } });

  // 5. Category + Menu Items
  let cat = await prisma.category.findUnique({ where: { name: 'Indian' } });
  if (!cat) cat = await prisma.category.create({ data: { name: 'Indian' } });

  // Clean old menu items for this category, then re-create
  await prisma.menuItem.deleteMany({ where: { categoryId: cat.id } });
  const item1 = await prisma.menuItem.create({ data: { name: 'Butter Chicken', price: 350, categoryId: cat.id, isAvailable: true } });
  const item2 = await prisma.menuItem.create({ data: { name: 'Dal Tadka', price: 180, categoryId: cat.id, isAvailable: true } });

  // 6. Create Orders + OrderItems + Payments (for sales/menu/payment analytics)
  const now = new Date();

  // Order 1: Completed + Paid (CASH)
  const order1 = await prisma.order.create({
    data: {
      tableId: table1.id, status: 'COMPLETED', subtotal: 700,
      orderItems: { create: [{ menuItemId: item1.id, quantity: 2, unitPrice: 350, lineTotal: 700 }] }
    }
  });
  await prisma.payment.create({
    data: { orderId: order1.id, amount: 700, paymentMethod: 'CASH', paymentStatus: 'COMPLETED', paidAt: now }
  });

  // Order 2: Completed + Paid (UPI)
  const order2 = await prisma.order.create({
    data: {
      tableId: table1.id, status: 'COMPLETED', subtotal: 360,
      orderItems: { create: [{ menuItemId: item2.id, quantity: 2, unitPrice: 180, lineTotal: 360 }] }
    }
  });
  await prisma.payment.create({
    data: { orderId: order2.id, amount: 360, paymentMethod: 'UPI', paymentStatus: 'COMPLETED', paidAt: now }
  });

  // Order 3: Completed + Paid (CARD) then Refunded
  const order3 = await prisma.order.create({
    data: {
      tableId: table1.id, status: 'COMPLETED', subtotal: 350,
      orderItems: { create: [{ menuItemId: item1.id, quantity: 1, unitPrice: 350, lineTotal: 350 }] }
    }
  });
  await prisma.payment.create({
    data: { orderId: order3.id, amount: 350, paymentMethod: 'CARD', paymentStatus: 'REFUNDED', paidAt: now }
  });

  // 7. Inventory items
  const inv1 = await prisma.inventoryItem.create({
    data: { name: 'Basmati Rice', sku: 'RICE-RPT-001', unit: 'kg', currentStock: 5, minimumStock: 10, costPrice: 120 }
  });
  const inv2 = await prisma.inventoryItem.create({
    data: { name: 'Saffron', sku: 'SAFF-RPT-001', unit: 'g', currentStock: 0, minimumStock: 5, costPrice: 500 }
  });
  // Stock movements
  await prisma.stockMovement.create({ data: { inventoryItemId: inv1.id, quantityChange: 50, reason: 'Purchase' } });
  await prisma.stockMovement.create({ data: { inventoryItemId: inv1.id, quantityChange: -45, reason: 'Used' } });
  await prisma.stockMovement.create({ data: { inventoryItemId: inv2.id, quantityChange: 10, reason: 'Purchase' } });
  await prisma.stockMovement.create({ data: { inventoryItemId: inv2.id, quantityChange: -10, reason: 'Fully consumed' } });

  // 8. Reservations
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(19, 0, 0, 0);

  await prisma.reservation.create({
    data: { customerId: cust1.id, tableId: table1.id, reservationTime: tomorrow, guestCount: 2, status: 'COMPLETED', estimatedDurationMinutes: 120 }
  });
  await prisma.reservation.create({
    data: { customerId: cust2.id, tableId: table1.id, reservationTime: new Date(tomorrow.getTime() + 3 * 3600000), guestCount: 3, status: 'CANCELLED', estimatedDurationMinutes: 90 }
  });
  await prisma.reservation.create({
    data: { customerId: cust1.id, tableId: table1.id, reservationTime: new Date(tomorrow.getTime() + 6 * 3600000), guestCount: 2, status: 'NO_SHOW', estimatedDurationMinutes: 120 }
  });

  await prisma.$disconnect();
  await pool.end();
  return { cust1, cust2, table1, cat, item1, item2, inv1, inv2, tomorrow };
}

async function run() {
  console.log('⏳ Cleaning and seeding database for Reports...');
  const { tomorrow } = await seed();
  console.log('✅ Seed complete.\n');

  // ─── Login ───
  let r = await req(`${baseUrl}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@restaurantos.local', password: 'Admin@12345' }),
  });
  const adminToken = r.body.accessToken;
  const adminHdrs = { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` };

  r = await req(`${baseUrl}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'cashier@restaurantos.local', password: 'Admin@12345' }),
  });
  const cashierHdrs = { 'Content-Type': 'application/json', Authorization: `Bearer ${r.body.accessToken}` };

  r = await req(`${baseUrl}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'waiter@restaurantos.local', password: 'Admin@12345' }),
  });
  const waiterHdrs = { 'Content-Type': 'application/json', Authorization: `Bearer ${r.body.accessToken}` };

  const results = [];
  function record(id, description, status, expected, body) {
    const passed = status === expected;
    results.push({ id, description, status, expected, passed });
    const bodyPreview = typeof body === 'object' ? JSON.stringify(body).slice(0, 200) : String(body).slice(0, 200);
    console.log(`[Scenario ${id}] ${description} -> ${passed ? '✅ PASSED' : '❌ FAILED'} (HTTP ${status})`);
    console.log(`  Response: ${bodyPreview}`);
  }

  // ─── 1. Daily revenue report ───
  r = await req(`${baseUrl}/reports/sales/daily`, { headers: adminHdrs });
  record(1, 'Daily revenue report', r.status, 200, r.body);

  // ─── 2. Monthly revenue report ───
  r = await req(`${baseUrl}/reports/sales/monthly`, { headers: adminHdrs });
  record(2, 'Monthly revenue report', r.status, 200, r.body);

  // ─── 3. Top-selling menu items ───
  r = await req(`${baseUrl}/reports/menu/top-selling?limit=5`, { headers: adminHdrs });
  record(3, 'Top-selling menu items', r.status, 200, r.body);

  // ─── 4. Payment method analytics ───
  r = await req(`${baseUrl}/reports/payments/methods`, { headers: adminHdrs });
  record(4, 'Payment method analytics (CASH vs UPI distribution)', r.status, 200, r.body);

  // ─── 5. Low-stock inventory report ───
  r = await req(`${baseUrl}/reports/inventory/low-stock`, { headers: adminHdrs });
  record(5, 'Low-stock inventory report', r.status, 200, r.body);

  // ─── 6. Top customer analytics (by spending) ───
  r = await req(`${baseUrl}/reports/customers/top-spenders?limit=5`, { headers: adminHdrs });
  record(6, 'Top customer analytics (by spending)', r.status, 200, r.body);

  // ─── 7. Reservation utilization analytics ───
  r = await req(`${baseUrl}/reports/reservations/utilization`, { headers: adminHdrs });
  record(7, 'Reservation utilization analytics', r.status, 200, r.body);

  // ─── 8. Date range filtering ───
  const today = new Date().toISOString().split('T')[0];
  r = await req(`${baseUrl}/reports/sales/range?startDate=${today}&endDate=${today}`, { headers: adminHdrs });
  record(8, 'Revenue by date range filtering', r.status, 200, r.body);

  // ─── 9. Authorization restrictions ───
  // 9a: Cashier can access sales
  r = await req(`${baseUrl}/reports/sales/daily`, { headers: cashierHdrs });
  record('9a', 'Cashier can access sales reports', r.status, 200, r.body);

  // 9b: Waiter cannot access sales
  r = await req(`${baseUrl}/reports/sales/daily`, { headers: waiterHdrs });
  record('9b', 'Waiter CANNOT access sales reports (expect 403)', r.status, 403, r.body);

  // 9c: Waiter cannot access menu analytics
  r = await req(`${baseUrl}/reports/menu/top-selling`, { headers: waiterHdrs });
  record('9c', 'Waiter CANNOT access menu analytics (expect 403)', r.status, 403, r.body);

  // 9d: Cashier cannot access menu analytics (ADMIN/MANAGER only)
  r = await req(`${baseUrl}/reports/menu/top-selling`, { headers: cashierHdrs });
  record('9d', 'Cashier CANNOT access menu analytics (expect 403)', r.status, 403, r.body);

  // ─── 10. Invalid date validation ───
  r = await req(`${baseUrl}/reports/sales/range?startDate=2026-12-31&endDate=2026-01-01`, { headers: adminHdrs });
  record(10, 'Invalid date range validation (startDate > endDate, expect 400)', r.status, 400, r.body);

  // ─── 11. Empty dataset handling ───
  // Sales range with no data (future date far ahead)
  r = await req(`${baseUrl}/reports/sales/range?startDate=2099-01-01&endDate=2099-12-31`, { headers: adminHdrs });
  record(11, 'Empty dataset returns valid response with zero values', r.status, 200, r.body);

  // ─── Additional analytics endpoints ───

  // 12. Weekly revenue
  r = await req(`${baseUrl}/reports/sales/weekly`, { headers: adminHdrs });
  record(12, 'Weekly revenue report', r.status, 200, r.body);

  // 13. Least-selling items
  r = await req(`${baseUrl}/reports/menu/least-selling?limit=5`, { headers: adminHdrs });
  record(13, 'Least-selling menu items', r.status, 200, r.body);

  // 14. Category breakdown
  r = await req(`${baseUrl}/reports/menu/category-breakdown`, { headers: adminHdrs });
  record(14, 'Category-wise sales breakdown', r.status, 200, r.body);

  // 15. Refund statistics
  r = await req(`${baseUrl}/reports/payments/refunds`, { headers: adminHdrs });
  record(15, 'Refund statistics', r.status, 200, r.body);

  // 16. Out-of-stock report
  r = await req(`${baseUrl}/reports/inventory/out-of-stock`, { headers: adminHdrs });
  record(16, 'Out-of-stock inventory report', r.status, 200, r.body);

  // 17. Inventory movements
  r = await req(`${baseUrl}/reports/inventory/movements?limit=10`, { headers: adminHdrs });
  record(17, 'Inventory movement summaries', r.status, 200, r.body);

  // 18. Top customers by visits
  r = await req(`${baseUrl}/reports/customers/top-visits?limit=5`, { headers: adminHdrs });
  record(18, 'Top customers by visits', r.status, 200, r.body);

  // 19. Loyalty leaderboard
  r = await req(`${baseUrl}/reports/customers/loyalty?limit=5`, { headers: adminHdrs });
  record(19, 'Loyalty leaderboard', r.status, 200, r.body);

  // 20. Daily reservations
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  r = await req(`${baseUrl}/reports/reservations/daily?date=${tomorrowStr}`, { headers: adminHdrs });
  record(20, 'Daily reservation report', r.status, 200, r.body);

  // 21. No-show statistics
  r = await req(`${baseUrl}/reports/reservations/no-shows`, { headers: adminHdrs });
  record(21, 'Reservation no-show statistics', r.status, 200, r.body);

  // 22. Unauthenticated request
  r = await req(`${baseUrl}/reports/sales/daily`, {});
  record(22, 'Unauthenticated request (expect 401)', r.status, 401, r.body);

  // Print Verification Matrix
  console.log('\n========================================================================');
  console.log('            REPORTING & ANALYTICS INTEGRATION TEST MATRIX               ');
  console.log('========================================================================');
  let passedCount = 0;
  results.forEach(res => {
    if (res.passed) passedCount++;
    console.log(`[Scenario ${String(res.id).padEnd(4)}] Expected: ${res.expected} | Actual: ${res.status} | ${res.passed ? '✓ PASS' : '✗ FAIL'} | ${res.description}`);
  });
  console.log('========================================================================');
  console.log(`TOTAL EXECUTED: ${results.length} | PASSED: ${passedCount} | FAILED: ${results.length - passedCount}`);
  console.log('========================================================================');

  if (passedCount === results.length) {
    console.log('🎉 All Reporting & Analytics integration tests passed!');
  } else {
    console.error('❌ Some tests failed.');
    process.exit(1);
  }
}

run().catch(console.error);
