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

  // 1. Clean up existing reservations (safe to delete completely as no other tables depend on it)
  await prisma.reservation.deleteMany();

  // 2. Setup Cashier & Waiter users if not exist
  const defaultPasswordHash = '$2b$10$Ac9Hknwaw3QItNJRxoxsWu0t6bv/eUl58orS.d76gm9vfgDXptZnG'; // Admin@12345

  await prisma.user.deleteMany({
    where: {
      email: { in: ['cashier@restaurantos.local', 'waiter@restaurantos.local'] }
    }
  });

  const cashier = await prisma.user.create({
    data: {
      email: 'cashier@restaurantos.local',
      passwordHash: defaultPasswordHash,
      name: 'Test Cashier',
      role: 'CASHIER',
      status: 'ACTIVE'
    }
  });

  const waiter = await prisma.user.create({
    data: {
      email: 'waiter@restaurantos.local',
      passwordHash: defaultPasswordHash,
      name: 'Test Waiter',
      role: 'WAITER',
      status: 'ACTIVE'
    }
  });

  // 3. Create or fetch test customers
  let john = await prisma.customer.findUnique({ where: { phone: '+919876543210' } });
  if (!john) {
    john = await prisma.customer.create({
      data: { name: 'John Doe', phone: '+919876543210', email: 'john@example.com' }
    });
  }

  let jane = await prisma.customer.findUnique({ where: { phone: '+918765432109' } });
  if (!jane) {
    jane = await prisma.customer.create({
      data: { name: 'Jane Smith', phone: '+918765432109', email: 'jane@example.com' }
    });
  }

  // 4. Create or fetch test tables
  let tableT1 = await prisma.table.findUnique({ where: { tableNumber: 'T1' } });
  if (tableT1) {
    tableT1 = await prisma.table.update({ where: { id: tableT1.id }, data: { status: 'AVAILABLE', capacity: 4 } });
  } else {
    tableT1 = await prisma.table.create({
      data: { tableNumber: 'T1', capacity: 4, status: 'AVAILABLE', name: 'Window 1' }
    });
  }

  let tableT2 = await prisma.table.findUnique({ where: { tableNumber: 'T2' } });
  if (tableT2) {
    tableT2 = await prisma.table.update({ where: { id: tableT2.id }, data: { status: 'AVAILABLE', capacity: 8 } });
  } else {
    tableT2 = await prisma.table.create({
      data: { tableNumber: 'T2', capacity: 8, status: 'AVAILABLE', name: 'Big Table' }
    });
  }

  let tableT99 = await prisma.table.findUnique({ where: { tableNumber: 'T99' } });
  if (tableT99) {
    tableT99 = await prisma.table.update({ where: { id: tableT99.id }, data: { status: 'OUT_OF_SERVICE', capacity: 2 } });
  } else {
    tableT99 = await prisma.table.create({
      data: { tableNumber: 'T99', capacity: 2, status: 'OUT_OF_SERVICE', name: 'Broken' }
    });
  }

  await prisma.$disconnect();
  await pool.end();
  return { john, jane, tableT1, tableT2, tableT99 };
}

async function run() {
  console.log('⏳ Cleaning and seeding database for Reservations...');
  const { john, jane, tableT1, tableT2, tableT99 } = await seed();
  console.log('✅ Seed complete.\n');

  // ─── Login ───
  let adminRes = await req(`${baseUrl}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@restaurantos.local', password: 'Admin@12345' }),
  });
  const adminToken = adminRes.body.accessToken;
  const adminHdrs = { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` };

  let cashierRes = await req(`${baseUrl}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'cashier@restaurantos.local', password: 'Admin@12345' }),
  });
  const cashierToken = cashierRes.body.accessToken;
  const cashierHdrs = { 'Content-Type': 'application/json', Authorization: `Bearer ${cashierToken}` };

  let waiterRes = await req(`${baseUrl}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'waiter@restaurantos.local', password: 'Admin@12345' }),
  });
  const waiterToken = waiterRes.body.accessToken;
  const waiterHdrs = { 'Content-Type': 'application/json', Authorization: `Bearer ${waiterToken}` };

  // Setup Tomorrow's base times for future validation
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(18, 0, 0, 0);
  const timeAStr = tomorrow.toISOString(); // 18:00

  const timeB = new Date(tomorrow);
  timeB.setHours(19, 0, 0, 0);
  const timeBStr = timeB.toISOString(); // 19:00 (overlaps A)

  const timeC = new Date(tomorrow);
  timeC.setHours(20, 15, 0, 0);
  const timeCStr = timeC.toISOString(); // 20:15 (does not overlap A)

  const timeD = new Date(tomorrow);
  timeD.setHours(14, 0, 0, 0);
  const timeDStr = timeD.toISOString(); // 14:00 (does not overlap A)

  const pastTime = new Date();
  pastTime.setHours(pastTime.getHours() - 2);
  const pastTimeStr = pastTime.toISOString(); // 2 hours ago

  const results = [];
  function record(id, description, status, expected, body) {
    const passed = status === expected;
    results.push({ id, description, status, expected, passed, details: body });
    console.log(`[Scenario ${id}] ${description} -> ${passed ? '✅ PASSED' : '❌ FAILED'} (HTTP ${status})`);
  }

  // ─── 1. Create reservation ───
  let r = await req(`${baseUrl}/reservations`, {
    method: 'POST', headers: cashierHdrs,
    body: JSON.stringify({
      customerId: john.id,
      tableId: tableT1.id,
      reservationTime: timeAStr,
      guestCount: 2,
      estimatedDurationMinutes: 120,
      notes: 'Anniversary'
    })
  });
  const resAId = r.body?.id;
  record(1, 'Create reservation successfully', r.status, 201, r.body);

  // ─── 2. Invalid customer ───
  r = await req(`${baseUrl}/reservations`, {
    method: 'POST', headers: cashierHdrs,
    body: JSON.stringify({
      customerId: '00000000-0000-4000-a000-000000000000',
      tableId: tableT1.id,
      reservationTime: timeAStr,
      guestCount: 2
    })
  });
  record(2, 'Create reservation with invalid customer (expect 404)', r.status, 404, r.body);

  // ─── 3. Invalid table ───
  r = await req(`${baseUrl}/reservations`, {
    method: 'POST', headers: cashierHdrs,
    body: JSON.stringify({
      customerId: john.id,
      tableId: '00000000-0000-4000-a000-000000000000',
      reservationTime: timeAStr,
      guestCount: 2
    })
  });
  record(3, 'Create reservation with invalid table (expect 404)', r.status, 404, r.body);

  // ─── 3.1 Out of Service Table ───
  r = await req(`${baseUrl}/reservations`, {
    method: 'POST', headers: cashierHdrs,
    body: JSON.stringify({
      customerId: john.id,
      tableId: tableT99.id,
      reservationTime: timeAStr,
      guestCount: 1
    })
  });
  record(3.1, 'Create reservation on OUT_OF_SERVICE table (expect 400)', r.status, 400, r.body);

  // ─── 4. Guest count exceeds capacity ───
  r = await req(`${baseUrl}/reservations`, {
    method: 'POST', headers: cashierHdrs,
    body: JSON.stringify({
      customerId: john.id,
      tableId: tableT1.id,
      reservationTime: timeAStr,
      guestCount: 6 // Capacity is 4
    })
  });
  record(4, 'Guest count exceeds table capacity (expect 400)', r.status, 400, r.body);

  // ─── 5. Past reservation time ───
  r = await req(`${baseUrl}/reservations`, {
    method: 'POST', headers: cashierHdrs,
    body: JSON.stringify({
      customerId: john.id,
      tableId: tableT1.id,
      reservationTime: pastTimeStr,
      guestCount: 2
    })
  });
  record(5, 'Reservation time in the past (expect 400)', r.status, 400, r.body);

  // ─── 6. Overlapping reservation conflict ───
  r = await req(`${baseUrl}/reservations`, {
    method: 'POST', headers: cashierHdrs,
    body: JSON.stringify({
      customerId: jane.id,
      tableId: tableT1.id,
      reservationTime: timeBStr, // 19:00 (overlaps John's 18:00 - 20:00 window)
      guestCount: 2,
      estimatedDurationMinutes: 60
    })
  });
  record(6, 'Overlapping reservation conflict detection (expect 409)', r.status, 409, r.body);

  // ─── 6.1 Non-overlapping reservation success ───
  r = await req(`${baseUrl}/reservations`, {
    method: 'POST', headers: cashierHdrs,
    body: JSON.stringify({
      customerId: jane.id,
      tableId: tableT1.id,
      reservationTime: timeDStr, // 14:00 - 16:00 (does not overlap John's 18:00 window)
      guestCount: 2,
      estimatedDurationMinutes: 120
    })
  });
  const resDId = r.body?.id;
  record(6.1, 'Non-overlapping reservation success (expect 201)', r.status, 201, r.body);

  // ─── 6.2 Duration-based overlap validation (Allowed edge-case) ───
  r = await req(`${baseUrl}/reservations`, {
    method: 'POST', headers: cashierHdrs,
    body: JSON.stringify({
      customerId: jane.id,
      tableId: tableT1.id,
      reservationTime: timeCStr, // 20:15 (John's slot ends at 20:00, so 20:15 is allowed)
      guestCount: 2,
      estimatedDurationMinutes: 120
    })
  });
  const resCId = r.body?.id;
  record(6.2, 'Duration-based overlap validation (Allowed Slot - expect 201)', r.status, 201, r.body);

  // ─── 7. Confirm reservation ───
  r = await req(`${baseUrl}/reservations/${resAId}/status`, {
    method: 'PATCH', headers: cashierHdrs,
    body: JSON.stringify({ status: 'CONFIRMED' })
  });
  record(7, 'Confirm reservation (PENDING -> CONFIRMED)', r.status, 200, r.body);

  // ─── 8. Seat reservation ───
  r = await req(`${baseUrl}/reservations/${resAId}/status`, {
    method: 'PATCH', headers: cashierHdrs,
    body: JSON.stringify({ status: 'SEATED' })
  });
  record(8, 'Seat reservation (CONFIRMED -> SEATED)', r.status, 200, r.body);

  // ─── 8.1 Table status auto-occupy ───
  // Retrieve T1 details from server
  let tableQuery = await req(`${baseUrl}/tables`, { headers: cashierHdrs });
  const t1Server = tableQuery.body.find(t => t.id === tableT1.id);
  const tableOccupied = t1Server?.status === 'OCCUPIED';
  record(8.1, 'Table automatically updated to OCCUPIED when seated', tableOccupied ? 200 : 500, 200, t1Server);

  // ─── 9. Complete reservation ───
  r = await req(`${baseUrl}/reservations/${resAId}/status`, {
    method: 'PATCH', headers: cashierHdrs,
    body: JSON.stringify({ status: 'COMPLETED' })
  });
  record(9, 'Complete reservation (SEATED -> COMPLETED)', r.status, 200, r.body);

  // ─── 9.1 Table status auto-release ───
  tableQuery = await req(`${baseUrl}/tables`, { headers: cashierHdrs });
  const t1ServerReleased = tableQuery.body.find(t => t.id === tableT1.id);
  const tableAvailable = t1ServerReleased?.status === 'AVAILABLE';
  record(9.1, 'Table automatically updated to AVAILABLE when completed', tableAvailable ? 200 : 500, 200, t1ServerReleased);

  // ─── 10. Cancel reservation ───
  // We will cancel Res D (which is PENDING)
  r = await req(`${baseUrl}/reservations/${resDId}/status`, {
    method: 'PATCH', headers: cashierHdrs,
    body: JSON.stringify({ status: 'CANCELLED' })
  });
  record(10, 'Cancel reservation (PENDING -> CANCELLED)', r.status, 200, r.body);

  // ─── 11. No-show reservation ───
  // First confirm Res C, then mark it NO_SHOW
  await req(`${baseUrl}/reservations/${resCId}/status`, {
    method: 'PATCH', headers: cashierHdrs,
    body: JSON.stringify({ status: 'CONFIRMED' })
  });
  r = await req(`${baseUrl}/reservations/${resCId}/status`, {
    method: 'PATCH', headers: cashierHdrs,
    body: JSON.stringify({ status: 'NO_SHOW' })
  });
  record(11, 'No-show reservation (CONFIRMED -> NO_SHOW)', r.status, 200, r.body);

  // ─── 12. Invalid status transition ───
  // Res D is CANCELLED. We try to transition to COMPLETED (expect 422)
  r = await req(`${baseUrl}/reservations/${resDId}/status`, {
    method: 'PATCH', headers: cashierHdrs,
    body: JSON.stringify({ status: 'COMPLETED' })
  });
  record(12, 'Invalid status transition (CANCELLED -> COMPLETED, expect 422)', r.status, 422, r.body);

  // ─── 15. Query by customer ───
  r = await req(`${baseUrl}/reservations/customer/${john.id}`, { headers: waiterHdrs });
  record(15, 'Query reservations by customer', r.status, 200, r.body);

  // ─── 16. Query by table ───
  r = await req(`${baseUrl}/reservations/table/${tableT1.id}`, { headers: waiterHdrs });
  record(16, 'Query reservations by table', r.status, 200, r.body);

  // ─── 17. Query by date ───
  // Format target date as YYYY-MM-DD
  const dateStr = timeAStr.split('T')[0];
  r = await req(`${baseUrl}/reservations/date/${dateStr}`, { headers: waiterHdrs });
  record(17, 'Query reservations by date', r.status, 200, r.body);

  // ─── 18. Authorization restrictions ───
  // Waiter attempts to create a reservation (expect 403 Forbidden)
  r = await req(`${baseUrl}/reservations`, {
    method: 'POST', headers: waiterHdrs,
    body: JSON.stringify({
      customerId: john.id,
      tableId: tableT2.id,
      reservationTime: timeAStr,
      guestCount: 2
    })
  });
  record(18, 'RBAC Access Control: Waiter creates reservation (expect 403)', r.status, 403, r.body);

  // Cashier attempts to delete a reservation (expect 403 Forbidden)
  r = await req(`${baseUrl}/reservations/${resAId}`, {
    method: 'DELETE', headers: cashierHdrs
  });
  record(18.1, 'RBAC Access Control: Cashier deletes reservation (expect 403)', r.status, 403, r.body);

  // Admin deletes a reservation successfully (expect 200)
  r = await req(`${baseUrl}/reservations/${resAId}`, {
    method: 'DELETE', headers: adminHdrs
  });
  record(18.2, 'RBAC Access Control: Admin deletes reservation successfully', r.status, 200, r.body);

  // ─── 19. Unauthenticated request ───
  r = await req(`${baseUrl}/reservations`, {
    method: 'POST',
    body: JSON.stringify({ customerId: john.id, tableId: tableT1.id })
  });
  record(19, 'Unauthenticated request rejects (expect 401)', r.status, 401, r.body);

  // ─── 20. Unknown reservation 404 ───
  r = await req(`${baseUrl}/reservations/00000000-0000-4000-a000-000000000000`, { headers: waiterHdrs });
  record(20, 'Get unknown reservation returns 404', r.status, 404, r.body);


  // Print Verification Matrix
  console.log('\n========================================================================');
  console.log('                 INTEGRATION TEST VERIFICATION MATRIX                    ');
  console.log('========================================================================');
  let passedCount = 0;
  results.forEach(res => {
    if (res.passed) passedCount++;
    console.log(`[Scenario ${res.id.toString().padEnd(4)}] Expected: ${res.expected} | Actual: ${res.status} | Passed: ${res.passed ? '✓ YES' : '✗ NO '} | ${res.description}`);
  });
  console.log('========================================================================');
  console.log(`TOTAL EXECUTED: ${results.length} | PASSED: ${passedCount} | FAILED: ${results.length - passedCount}`);
  console.log('========================================================================');

  if (passedCount !== results.length) {
    console.error('❌ Some integration tests failed!');
    process.exit(1);
  } else {
    console.log('🎉 All integration tests complete successfully!');
  }
}

run().catch(console.error);
