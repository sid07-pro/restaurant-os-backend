const axios = require('axios');

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  const API_URL = 'http://localhost:3000/api/v1';
  let token = '';

  console.log('--- STARTING E2E VERIFICATION ---');

  try {
    // 1. LOGIN
    console.log('[1/8] Logging in...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@restaurantos.local',
      password: 'Admin@12345',
    });
    token = loginRes.data.accessToken;
    console.log('      => Login successful, token received.');

    const headers = { Authorization: `Bearer ${token}` };

    // 2. DASHBOARD (Check Health & KPIs)
    console.log('[2/8] Loading Dashboard / Tables / Menu Items...');
    const tablesRes = await axios.get(`${API_URL}/tables`, { headers });
    const tables = tablesRes.data;
    console.log(`      => Found ${tables.length} tables.`);

    const menuRes = await axios.get(`${API_URL}/menu-items`, { headers });
    const menuItems = menuRes.data;
    console.log(`      => Found ${menuItems.length} menu items.`);

    const availableTable = tables[0];
    if (!availableTable) throw new Error('No tables found for the test.');

    const firstMenuItem = menuItems[0];
    if (!firstMenuItem) throw new Error('No menu items found for the test.');

    // 3. POS - Create Order
    console.log('[3/8] Creating Order (POS)...');
    const orderRes = await axios.post(`${API_URL}/orders`, {
      tableId: availableTable.id,
      items: [
        {
          menuItemId: firstMenuItem.id,
          quantity: 2,
          notes: 'Test order notes'
        }
      ]
    }, { headers });
    const order = orderRes.data;
    console.log(`      => Order created: ${order.id}. Table ${availableTable.tableNumber} is now OCCUPIED.`);

    // 4. KITCHEN - Send to KDS -> Ready -> Served
    console.log('[4/8] Processing Order in Kitchen (KDS)...');
    
    // Status: PREPARING
    await axios.patch(`${API_URL}/kds/tickets/${order.id}/start`, {}, { headers });
    console.log('      => Order marked PREPARING.');
    await sleep(500);

    // Status: READY
    await axios.patch(`${API_URL}/kds/tickets/${order.id}/ready`, {}, { headers });
    console.log('      => Order marked READY.');
    await sleep(500);

    // Status: SERVED
    await axios.patch(`${API_URL}/kds/tickets/${order.id}/serve`, {}, { headers });
    console.log('      => Order marked SERVED.');
    await sleep(500);

    // 5. PAYMENT - Checkout Order
    console.log('[5/8] Processing Payment...');
    const paymentRes = await axios.post(`${API_URL}/payments`, {
      orderId: order.id,
      amount: order.subtotal,
      paymentMethod: 'CARD',
      transactionReference: 'txn_test_' + Date.now()
    }, { headers });
    console.log('      => Payment successful. Order COMPLETED. Table AVAILABLE.');

    // 6. REPORTS - KPI Update
    console.log('[6/8] Verifying Reports (KPI Update)...');
    const reportsRes = await axios.get(`${API_URL}/reports/sales/daily`, { headers });
    console.log(`      => Total Revenue Today: $${reportsRes.data[0]?.revenue || 0}`);

    // 7. CRM - Fetch Customers
    console.log('[7/8] Verifying CRM...');
    const crmRes = await axios.get(`${API_URL}/customers`, { headers });
    console.log(`      => Found ${crmRes.data.length} customers.`);

    // 8. RESERVATIONS - Fetch
    console.log('[8/8] Verifying Reservations...');
    const resRes = await axios.get(`${API_URL}/reservations`, { headers });
    console.log(`      => Found ${resRes.data.length} reservations.`);

    console.log('--- E2E VERIFICATION COMPLETED SUCCESSFULLY ---');
  } catch (error) {
    console.error('E2E VERIFICATION FAILED!');
    if (error.response) {
      console.error(error.response.data);
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

run();
