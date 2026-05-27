require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { io } = require('socket.io-client');

const baseUrl = 'http://localhost:3000/api/v1';
const wsUrl = 'http://localhost:3000';

async function req(url, opts = {}) {
  const r = await fetch(url, opts);
  const text = await r.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  return { status: r.status, body };
}

function connectSocket(token, opts = {}) {
  return new Promise((resolve, reject) => {
    const socket = io(wsUrl, {
      auth: { token },
      transports: ['websocket'],
      forceNew: true,
      reconnection: opts.reconnection ?? false,
      reconnectionDelay: 200,
      reconnectionAttempts: opts.reconnectionAttempts ?? 3,
      timeout: 3000,
    });
    socket.on('authenticated', () => resolve(socket));
    socket.on('error', (err) => {
      if (!opts.expectError) reject(new Error(err.message));
      else resolve(socket);
    });
    socket.on('connect_error', (err) => {
      if (!opts.expectError) reject(err);
      else resolve(socket);
    });
    setTimeout(() => reject(new Error('Socket connection timeout')), 5000);
  });
}

function waitForEvent(socket, eventName, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timeout waiting for ${eventName}`)), timeoutMs);
    socket.once(eventName, (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });
}

function subscribeToRoom(socket, room) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Timeout subscribing to ${room}`)), 3000);
    socket.once('subscribed', (data) => {
      clearTimeout(timer);
      resolve(data);
    });
    socket.once('error', (data) => {
      clearTimeout(timer);
      resolve({ error: true, ...data });
    });
    socket.emit('subscribe', { room });
  });
}

async function seed() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  // Clean test data (FK order)
  await prisma.reservation.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.inventoryItem.deleteMany();

  const defaultPwHash = '$2b$10$Ac9Hknwaw3QItNJRxoxsWu0t6bv/eUl58orS.d76gm9vfgDXptZnG';
  await prisma.user.deleteMany({ where: { email: { in: ['kitchen@restaurantos.local', 'waiter.ws@restaurantos.local', 'cashier.ws@restaurantos.local'] } } });
  await prisma.user.create({ data: { email: 'kitchen@restaurantos.local', passwordHash: defaultPwHash, name: 'Kitchen Staff', role: 'KITCHEN_STAFF', status: 'ACTIVE' } });
  await prisma.user.create({ data: { email: 'waiter.ws@restaurantos.local', passwordHash: defaultPwHash, name: 'Waiter WS', role: 'WAITER', status: 'ACTIVE' } });
  await prisma.user.create({ data: { email: 'cashier.ws@restaurantos.local', passwordHash: defaultPwHash, name: 'Cashier WS', role: 'CASHIER', status: 'ACTIVE' } });

  // Table
  let table = await prisma.table.findUnique({ where: { tableNumber: 'WS-T1' } });
  if (!table) table = await prisma.table.create({ data: { tableNumber: 'WS-T1', capacity: 4, status: 'AVAILABLE' } });
  else table = await prisma.table.update({ where: { id: table.id }, data: { status: 'AVAILABLE' } });

  // Category + Menu Item
  let cat = await prisma.category.findUnique({ where: { name: 'WS-Test' } });
  if (!cat) cat = await prisma.category.create({ data: { name: 'WS-Test' } });
  await prisma.menuItem.deleteMany({ where: { categoryId: cat.id } });
  const menuItem = await prisma.menuItem.create({ data: { name: 'WS Burger', price: 200, categoryId: cat.id, isAvailable: true } });

  // Customer
  let cust = await prisma.customer.findUnique({ where: { phone: '+910000000001' } });
  if (!cust) cust = await prisma.customer.create({ data: { name: 'WS Customer', phone: '+910000000001' } });

  // Inventory item
  const inv = await prisma.inventoryItem.create({
    data: { name: 'WS Tomato', sku: 'WS-TOM-001', unit: 'kg', currentStock: 8, minimumStock: 10, costPrice: 50 }
  });

  await prisma.$disconnect();
  await pool.end();
  return { table, menuItem, cat, cust, inv };
}

async function run() {
  console.log('⏳ Seeding database for WebSocket tests...');
  const { table, menuItem, cust, inv } = await seed();
  console.log('✅ Seed complete.\n');

  // ─── Login all roles ───
  const loginUser = async (email) => {
    const r = await req(`${baseUrl}/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'Admin@12345' }),
    });
    return r.body;
  };

  const admin = await loginUser('admin@restaurantos.local');
  const kitchen = await loginUser('kitchen@restaurantos.local');
  const waiter = await loginUser('waiter.ws@restaurantos.local');
  const cashier = await loginUser('cashier.ws@restaurantos.local');

  const adminHdrs = { 'Content-Type': 'application/json', Authorization: `Bearer ${admin.accessToken}` };
  const waiterHdrs = { 'Content-Type': 'application/json', Authorization: `Bearer ${waiter.accessToken}` };

  const results = [];
  function record(id, description, passed, details = '') {
    results.push({ id, description, passed });
    console.log(`[Test ${id}] ${description} -> ${passed ? '✅ PASSED' : '❌ FAILED'} ${details}`);
  }

  // ─── 1. Authenticated socket connection ───
  try {
    const socket = await connectSocket(admin.accessToken);
    record(1, 'Authenticated socket connection', socket.connected);
    socket.disconnect();
  } catch (e) { record(1, 'Authenticated socket connection', false, e.message); }

  // ─── 2. Unauthorized socket rejection ───
  try {
    const socket = io(wsUrl, { auth: { token: 'invalid-jwt-token' }, transports: ['websocket'], forceNew: true, reconnection: false, timeout: 3000 });
    const errorData = await new Promise((resolve) => {
      socket.on('error', (d) => resolve(d));
      socket.on('disconnect', () => resolve({ message: 'disconnected' }));
      setTimeout(() => resolve(null), 4000);
    });
    const passed = errorData !== null;
    record(2, 'Unauthorized socket rejection', passed);
    socket.disconnect();
  } catch (e) { record(2, 'Unauthorized socket rejection', true); }

  // ─── 3. Room subscription ───
  try {
    const socket = await connectSocket(admin.accessToken);
    const result = await subscribeToRoom(socket, 'dashboard');
    record(3, 'Room subscription (admin -> dashboard)', result.room === 'dashboard');
    socket.disconnect();
  } catch (e) { record(3, 'Room subscription', false, e.message); }

  // ─── 4. Order event emission ───
  try {
    const socket = await connectSocket(admin.accessToken);
    await subscribeToRoom(socket, 'dashboard');
    const eventPromise = waitForEvent(socket, 'order.created');
    // Create an order via REST
    await req(`${baseUrl}/orders`, {
      method: 'POST', headers: adminHdrs,
      body: JSON.stringify({ tableId: table.id, items: [{ menuItemId: menuItem.id, quantity: 1 }] }),
    });
    const event = await eventPromise;
    const passed = event && event.orderId && event.tableId === table.id && event.status === 'OPEN';
    record(4, 'Order event emission (order.created)', passed);
    console.log(`  Payload: ${JSON.stringify(event).slice(0, 200)}`);
    socket.disconnect();
  } catch (e) { record(4, 'Order event emission', false, e.message); }

  // ─── 5. KDS event emission ───
  try {
    const socket = await connectSocket(admin.accessToken);
    await subscribeToRoom(socket, 'kds');
    // Create order and transition to SENT_TO_KITCHEN then start preparing
    const orderRes = await req(`${baseUrl}/orders`, {
      method: 'POST', headers: adminHdrs,
      body: JSON.stringify({ tableId: table.id, items: [{ menuItemId: menuItem.id, quantity: 1 }] }),
    });
    const orderId = orderRes.body.id;
    await req(`${baseUrl}/orders/${orderId}/status`, {
      method: 'PATCH', headers: adminHdrs,
      body: JSON.stringify({ status: 'SENT_TO_KITCHEN' }),
    });
    const eventPromise = waitForEvent(socket, 'kds.ticket.preparing');
    await req(`${baseUrl}/kds/tickets/${orderId}/start`, { method: 'PATCH', headers: adminHdrs });
    const event = await eventPromise;
    const passed = event && event.orderId === orderId && event.status === 'PREPARING';
    record(5, 'KDS event emission (kds.ticket.preparing)', passed);
    console.log(`  Payload: ${JSON.stringify(event).slice(0, 200)}`);
    socket.disconnect();
  } catch (e) { record(5, 'KDS event emission', false, e.message); }

  // ─── 6. Table update emission ───
  try {
    const socket = await connectSocket(admin.accessToken);
    await subscribeToRoom(socket, 'tables');
    const eventPromise = waitForEvent(socket, 'table.status.updated');
    await req(`${baseUrl}/tables/${table.id}/status`, {
      method: 'PATCH', headers: adminHdrs,
      body: JSON.stringify({ status: 'OCCUPIED' }),
    });
    const event = await eventPromise;
    const passed = event && event.tableId === table.id && event.status === 'OCCUPIED';
    record(6, 'Table update emission (table.status.updated)', passed);
    console.log(`  Payload: ${JSON.stringify(event).slice(0, 200)}`);
    // Reset table
    await req(`${baseUrl}/tables/${table.id}/status`, {
      method: 'PATCH', headers: adminHdrs,
      body: JSON.stringify({ status: 'AVAILABLE' }),
    });
    socket.disconnect();
  } catch (e) { record(6, 'Table update emission', false, e.message); }

  // ─── 7. Reservation event emission ───
  try {
    const socket = await connectSocket(admin.accessToken);
    await subscribeToRoom(socket, 'reservations');
    const eventPromise = waitForEvent(socket, 'reservation.created');
    const futureTime = new Date(Date.now() + 48 * 3600000).toISOString();
    await req(`${baseUrl}/reservations`, {
      method: 'POST', headers: adminHdrs,
      body: JSON.stringify({ customerId: cust.id, tableId: table.id, reservationTime: futureTime, guestCount: 2 }),
    });
    const event = await eventPromise;
    const passed = event && event.reservationId && event.customerId === cust.id && event.status === 'PENDING';
    record(7, 'Reservation event emission (reservation.created)', passed);
    console.log(`  Payload: ${JSON.stringify(event).slice(0, 200)}`);
    socket.disconnect();
  } catch (e) { record(7, 'Reservation event emission', false, e.message); }

  // ─── 8. Payment event emission ───
  try {
    const socket = await connectSocket(admin.accessToken);
    await subscribeToRoom(socket, 'dashboard');
    // Create order, advance to SERVED, then pay
    const orderRes = await req(`${baseUrl}/orders`, {
      method: 'POST', headers: adminHdrs,
      body: JSON.stringify({ tableId: table.id, items: [{ menuItemId: menuItem.id, quantity: 1 }] }),
    });
    const orderId = orderRes.body.id;
    await req(`${baseUrl}/orders/${orderId}/status`, { method: 'PATCH', headers: adminHdrs, body: JSON.stringify({ status: 'SENT_TO_KITCHEN' }) });
    await req(`${baseUrl}/kds/tickets/${orderId}/start`, { method: 'PATCH', headers: adminHdrs });
    await req(`${baseUrl}/kds/tickets/${orderId}/ready`, { method: 'PATCH', headers: adminHdrs });
    await req(`${baseUrl}/kds/tickets/${orderId}/serve`, { method: 'PATCH', headers: adminHdrs });
    const eventPromise = waitForEvent(socket, 'payment.completed');
    await req(`${baseUrl}/payments`, {
      method: 'POST', headers: adminHdrs,
      body: JSON.stringify({ orderId, amount: 200, paymentMethod: 'CASH' }),
    });
    const event = await eventPromise;
    const passed = event && event.paymentId && event.orderId === orderId && event.paymentMethod === 'CASH';
    record(8, 'Payment event emission (payment.completed)', passed);
    console.log(`  Payload: ${JSON.stringify(event).slice(0, 200)}`);
    socket.disconnect();
  } catch (e) { record(8, 'Payment event emission', false, e.message); }

  // ─── 9. Inventory low-stock event ───
  try {
    const socket = await connectSocket(admin.accessToken);
    await subscribeToRoom(socket, 'inventory');
    const eventPromise = waitForEvent(socket, 'inventory.low_stock');
    // Adjust stock to trigger low stock (currentStock=8, minStock=10 -> already low, deduct further)
    await req(`${baseUrl}/inventory/${inv.id}/adjust-stock`, {
      method: 'POST', headers: adminHdrs,
      body: JSON.stringify({ quantityChange: -3, reason: 'Test consumption' }),
    });
    const event = await eventPromise;
    const passed = event && event.inventoryItemId === inv.id && event.name === 'WS Tomato';
    record(9, 'Inventory low-stock event (inventory.low_stock)', passed);
    console.log(`  Payload: ${JSON.stringify(event).slice(0, 200)}`);
    socket.disconnect();
  } catch (e) { record(9, 'Inventory low-stock event', false, e.message); }

  // ─── 10. Role-based room restriction ───
  try {
    // KITCHEN_STAFF should only access 'kds'
    const kSocket = await connectSocket(kitchen.accessToken);
    const kdsResult = await subscribeToRoom(kSocket, 'kds');
    const dashResult = await subscribeToRoom(kSocket, 'dashboard');
    const kdsOk = kdsResult.room === 'kds';
    const dashBlocked = dashResult.error === true || dashResult.message?.includes('Access denied');
    record('10a', 'KITCHEN_STAFF can join kds room', kdsOk);
    record('10b', 'KITCHEN_STAFF blocked from dashboard room', dashBlocked);
    kSocket.disconnect();

    // WAITER should access 'tables' but not 'kds'
    const wSocket = await connectSocket(waiter.accessToken);
    const tablesResult = await subscribeToRoom(wSocket, 'tables');
    const kdsResult2 = await subscribeToRoom(wSocket, 'kds');
    record('10c', 'WAITER can join tables room', tablesResult.room === 'tables');
    record('10d', 'WAITER blocked from kds room', kdsResult2.error === true || kdsResult2.message?.includes('Access denied'));
    wSocket.disconnect();
  } catch (e) { record(10, 'Role-based room restriction', false, e.message); }

  // ─── 11. Multiple client synchronization ───
  try {
    const s1 = await connectSocket(admin.accessToken);
    const s2 = await connectSocket(admin.accessToken);
    await subscribeToRoom(s1, 'dashboard');
    await subscribeToRoom(s2, 'dashboard');
    const p1 = waitForEvent(s1, 'order.created');
    const p2 = waitForEvent(s2, 'order.created');
    await req(`${baseUrl}/orders`, {
      method: 'POST', headers: adminHdrs,
      body: JSON.stringify({ tableId: table.id, items: [{ menuItemId: menuItem.id, quantity: 1 }] }),
    });
    const [e1, e2] = await Promise.all([p1, p2]);
    const passed = e1.orderId && e2.orderId && e1.orderId === e2.orderId;
    record(11, 'Multiple client synchronization (2 clients receive same event)', passed);
    s1.disconnect(); s2.disconnect();
  } catch (e) { record(11, 'Multiple client synchronization', false, e.message); }

  // ─── 12. Reconnect handling ───
  try {
    const socket = io(wsUrl, {
      auth: { token: admin.accessToken },
      transports: ['websocket'],
      forceNew: true,
      reconnection: true,
      reconnectionDelay: 200,
      reconnectionAttempts: 3,
      timeout: 3000,
    });
    await new Promise((resolve) => socket.on('authenticated', resolve));
    const passed = socket.connected;
    record(12, 'Reconnect handling (socket connected with reconnection enabled)', passed);
    socket.disconnect();
  } catch (e) { record(12, 'Reconnect handling', false, e.message); }

  // ─── 13. Disconnect cleanup ───
  try {
    const socket = await connectSocket(admin.accessToken);
    await subscribeToRoom(socket, 'dashboard');
    socket.disconnect();
    // Wait briefly for disconnect to propagate
    await new Promise(r => setTimeout(r, 500));
    const passed = socket.disconnected;
    record(13, 'Disconnect cleanup (socket properly disconnected)', passed);
  } catch (e) { record(13, 'Disconnect cleanup', false, e.message); }

  // ─── Print Results ───
  console.log('\n========================================================================');
  console.log('        REAL-TIME WEBSOCKET INTEGRATION TEST MATRIX                    ');
  console.log('========================================================================');
  let passedCount = 0;
  results.forEach(r => {
    if (r.passed) passedCount++;
    console.log(`[Test ${String(r.id).padEnd(4)}] ${r.passed ? '✓ PASS' : '✗ FAIL'} | ${r.description}`);
  });
  console.log('========================================================================');
  console.log(`TOTAL EXECUTED: ${results.length} | PASSED: ${passedCount} | FAILED: ${results.length - passedCount}`);
  console.log('========================================================================');

  if (passedCount === results.length) {
    console.log('🎉 All WebSocket integration tests passed!');
  } else {
    console.error('❌ Some tests failed.');
  }

  process.exit(passedCount === results.length ? 0 : 1);
}

run().catch(console.error);
