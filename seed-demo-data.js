async function fetchAPI(url, method, token, body = null) {
  const options = {
    method,
    headers: { 'Authorization': `Bearer ${token}` }
  };
  if (body) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text();
    console.error(`Error on ${method} ${url}: ${text}`);
    return null;
  }
  return res.json();
}

async function main() {
  const API_URL = 'http://localhost:3000/api/v1';

  // Login
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@restaurantos.local', password: 'Admin@12345' })
  });
  const { accessToken } = await loginRes.json();
  const t = accessToken;

  console.log('--- SEEDING DEMO DATA ---');

  // 1. CUSTOMERS
  console.log('Creating 15 customers...');
  const existingCustomers = await fetchAPI(`${API_URL}/customers`, 'GET', t) || [];
  const customerIds = existingCustomers.map(c => c.id);
  
  for (let i = existingCustomers.length + 1; i <= 15; i++) {
    const cust = await fetchAPI(`${API_URL}/customers`, 'POST', t, {
      name: `Demo Customer ${i}`,
      email: `customer${i}_${Date.now()}@example.com`,
      phone: `+9198765400${i.toString().padStart(2, '0')}`
    });
    if (cust) customerIds.push(cust.id);
  }

  if (customerIds.length === 0) {
     console.error('No customers available to link reservations!');
     return;
  }

  // 2. TABLES
  console.log('Ensuring 10 tables...');
  const tables = await fetchAPI(`${API_URL}/tables`, 'GET', t);
  const tableIds = tables.map(tb => tb.id);
  for (let i = tables.length + 1; i <= 10; i++) {
    const tb = await fetchAPI(`${API_URL}/tables`, 'POST', t, {
      tableNumber: `T${i}`,
      capacity: 4,
      status: 'AVAILABLE'
    });
    if (tb) tableIds.push(tb.id);
  }

  // 3. CATEGORIES
  console.log('Ensuring 5 categories...');
  const cats = await fetchAPI(`${API_URL}/categories`, 'GET', t);
  const catNames = ['Appetizers', 'Mains', 'Desserts', 'Beverages', 'Specials'];
  const catIds = [];
  for (let i = 0; i < 5; i++) {
    let cat = cats.find(c => c.name === catNames[i]);
    if (!cat) {
      cat = await fetchAPI(`${API_URL}/categories`, 'POST', t, {
        name: catNames[i],
        description: `Delicious ${catNames[i]}`
      });
    }
    if (cat) catIds.push(cat.id);
  }

  // 4. MENU ITEMS
  console.log('Ensuring 25 menu items...');
  let menuItems = await fetchAPI(`${API_URL}/menu-items`, 'GET', t);
  const menuIds = menuItems.map(m => m.id);
  for (let i = menuItems.length + 1; i <= 25; i++) {
    const catId = catIds[i % catIds.length];
    const mi = await fetchAPI(`${API_URL}/menu-items`, 'POST', t, {
      categoryId: catId,
      name: `Demo Item ${i}`,
      description: `Tasty demo item ${i}`,
      price: Math.floor(Math.random() * 20) + 5,
      available: true
    });
    if (mi) menuIds.push(mi.id);
  }

  // 5. RESERVATIONS
  console.log('Creating 10 reservations...');
  for (let i = 1; i <= 10; i++) {
    const custId = customerIds[i % customerIds.length];
    const tbId = tableIds[i % tableIds.length];
    const date = new Date();
    date.setHours(date.getHours() + i);
    await fetchAPI(`${API_URL}/reservations`, 'POST', t, {
      customerId: custId,
      tableId: tbId,
      guestCount: Math.floor(Math.random() * 4) + 1,
      reservationTime: date.toISOString()
    });
  }

  // 6. ORDERS & PAYMENTS
  console.log('Creating 15 orders & payments...');
  for (let i = 1; i <= 15; i++) {
    const tbId = tableIds[i % tableIds.length];
    const custId = customerIds[i % customerIds.length];
    const mId1 = menuIds[i % menuIds.length];
    const mId2 = menuIds[(i + 1) % menuIds.length];

    const order = await fetchAPI(`${API_URL}/orders`, 'POST', t, {
      tableId: tbId,
      items: [
        { menuItemId: mId1, quantity: 2 },
        { menuItemId: mId2, quantity: 1 }
      ]
    });

    if (order) {
      // Simulate KDS
      await fetchAPI(`${API_URL}/kds/tickets/${order.id}/start`, 'PATCH', t, {});
      await fetchAPI(`${API_URL}/kds/tickets/${order.id}/ready`, 'PATCH', t, {});
      await fetchAPI(`${API_URL}/kds/tickets/${order.id}/serve`, 'PATCH', t, {});

      // Simulate Payment
      await fetchAPI(`${API_URL}/payments`, 'POST', t, {
        orderId: order.id,
        amount: order.subtotal,
        paymentMethod: i % 2 === 0 ? 'CARD' : 'CASH',
        transactionReference: `txn_demo_${Date.now()}_${i}`
      });
    }
  }

  console.log('--- SEEDING COMPLETED ---');
}

main().catch(console.error);
