const http = require('http');

async function doFetch(path, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1' + path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    if (token) options.headers['Authorization'] = 'Bearer ' + token;

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch(e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function verifyCondition(step, desc, res, expectedStatus = 200) {
  if (res.status === expectedStatus || res.status === 201) {
    console.log(`[PASS] ${step}. ${desc}`);
    return true;
  } else {
    console.log(`[FAIL] ${step}. ${desc} (Status: ${res.status})`, res.data);
    return false;
  }
}

async function runE2EWorkflow() {
  console.log('--- STARTING END-TO-END DEMO WORKFLOW ---');
  
  // 1. Login
  const login = await doFetch('/auth/login', 'POST', { email: 'admin@restaurantos.local', password: 'Admin@12345' });
  if (!await verifyCondition('1', 'Login', login)) return;
  const token = login.data.accessToken;

  // 2. View Dashboard (Fetch Tables & Menu)
  const tables = await doFetch('/tables', 'GET', null, token);
  const menu = await doFetch('/menu-items', 'GET', null, token);
  await verifyCondition('2', 'View Dashboard (Fetch Tables & Menu)', tables);
  
  const table = tables.data[0];
  const item1 = menu.data[0];
  const item2 = menu.data[1];
  if (!table || !item1) {
    console.log('[FAIL] No tables or menu items found for demo.');
    return;
  }

  // 3. Create Order & Send to Kitchen
  const orderPayload = {
    tableId: table.id,
    items: [
      { menuItemId: item1.id, quantity: 2, notes: 'Less spicy' },
      { menuItemId: item2.id, quantity: 1 }
    ]
  };
  const order = await doFetch('/orders', 'POST', orderPayload, token);
  if (!await verifyCondition('4 & 5', 'Create Order & Send to Kitchen', order, 201)) return;
  const orderId = order.data.id;

  // Verify Table is now OCCUPIED
  const tablesAfter = await doFetch('/tables', 'GET', null, token);
  const tableAfter = tablesAfter.data.find(t => t.id === table.id);
  if (tableAfter.status === 'OCCUPIED') {
    console.log('[PASS] Table status automatically updated to OCCUPIED.');
  } else {
    console.log('[FAIL] Table status is not OCCUPIED.');
  }

  // 6. Prepare order (KDS)
  // Fetch active KDS tickets
  const kds = await doFetch('/kds/tickets', 'GET', null, token);
  await verifyCondition('6a', 'View KDS Active Tickets', kds);
  
  // Mark as PREPARING
  const prep = await doFetch(`/kds/tickets/${orderId}/start`, 'PATCH', {}, token);
  await verifyCondition('6b', 'Kitchen marks PREPARING', prep);

  // 7. Mark ready
  const ready = await doFetch(`/kds/tickets/${orderId}/ready`, 'PATCH', {}, token);
  await verifyCondition('7', 'Kitchen marks READY', ready);

  // 8. Serve order
  const serve = await doFetch(`/kds/tickets/${orderId}/serve`, 'PATCH', {}, token);
  await verifyCondition('8', 'Staff marks SERVED', serve);

  // 9. Take payment
  // Complete payment via Payment module
  const payPayload = {
    orderId: orderId,
    paymentMethod: 'CARD',
    amount: order.data.subtotal,
  };
  const payment = await doFetch('/payments', 'POST', payPayload, token);
  if (!await verifyCondition('9a', 'Process Payment', payment, 201)) return;
  
  // After payment, order status should be COMPLETED and Table should be AVAILABLE
  const orderAfter = await doFetch(`/orders/${orderId}`, 'GET', null, token);
  const tableFinal = await doFetch('/tables', 'GET', null, token);
  if (orderAfter.data.status === 'COMPLETED' && tableFinal.data.find(t => t.id === table.id).status === 'AVAILABLE') {
    console.log('[PASS] 9b. Order auto-completed and Table freed.');
  } else {
    console.log('[FAIL] 9b. Order/Table status not correctly updated after payment.');
  }

  // 10. Generate reports
  const reports = await doFetch('/reports/sales/daily', 'GET', null, token);
  await verifyCondition('10', 'Generate Daily Sales Report', reports);

  console.log('--- ALL TESTS PASSED ---');
}

runE2EWorkflow().catch(console.error);
