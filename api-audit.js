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

async function runAudit() {
  console.log('--- RESTAURANT OS BACKEND AUDIT ---');
  
  // 1. Login
  const loginRes = await doFetch('/auth/login', 'POST', { email: 'admin@restaurantos.local', password: 'Admin@12345' });
  console.log('Login Status:', loginRes.status);
  
  if (loginRes.status !== 200) {
    console.log('Cannot login. Aborting.', loginRes.data);
    return;
  }
  
  const token = loginRes.data.accessToken;
  console.log('Got Token.');

  // 2. Fetch Tables
  const tables = await doFetch('/tables', 'GET', null, token);
  console.log(`Tables: ${tables.status} - Count: ${tables.data.length || 0}`);

  // 3. Fetch Categories
  const cats = await doFetch('/categories', 'GET', null, token);
  console.log(`Categories: ${cats.status} - Count: ${cats.data.length || 0}`);

  // 4. Fetch Menu
  const menu = await doFetch('/menu-items', 'GET', null, token);
  console.log(`Menu Items: ${menu.status} - Count: ${menu.data.length || 0}`);

  // 5. Fetch Inventory
  const inv = await doFetch('/inventory', 'GET', null, token);
  console.log(`Inventory: ${inv.status} - Count: ${inv.data.length || 0}`);

  // 6. Fetch Customers
  const cust = await doFetch('/customers', 'GET', null, token);
  console.log(`Customers: ${cust.status} - Count: ${cust.data.length || 0}`);

  // 7. Fetch Orders
  const orders = await doFetch('/orders', 'GET', null, token);
  console.log(`Orders: ${orders.status} - Count: ${orders.data.length || 0}`);

  if (!tables.data.length) {
    console.log('Seeding Tables...');
    await doFetch('/tables', 'POST', { tableNumber: 'T1', name: 'Window 1', capacity: 4 }, token);
    await doFetch('/tables', 'POST', { tableNumber: 'T2', name: 'Window 2', capacity: 2 }, token);
    await doFetch('/tables', 'POST', { tableNumber: 'T3', name: 'Patio 1', capacity: 6 }, token);
  }
  
  if (!cats.data.length) {
    console.log('Seeding Categories...');
    const c1 = await doFetch('/categories', 'POST', { name: 'Mains' }, token);
    const c2 = await doFetch('/categories', 'POST', { name: 'Beverages' }, token);
    
    console.log('Seeding Menu...');
    await doFetch('/menu-items', 'POST', { name: 'Margherita Pizza', price: 299, categoryId: c1.data.id, isAvailable: true }, token);
    await doFetch('/menu-items', 'POST', { name: 'Pasta Alfredo', price: 349, categoryId: c1.data.id, isAvailable: true }, token);
    await doFetch('/menu-items', 'POST', { name: 'Coke', price: 99, categoryId: c2.data.id, isAvailable: true }, token);
  }

  if (!inv.data.length) {
    console.log('Seeding Inventory...');
    await doFetch('/inventory', 'POST', { name: 'Cheese', sku: 'INV-CHZ', unit: 'kg', currentStock: 10, minimumStock: 2, costPrice: 400 }, token);
    await doFetch('/inventory', 'POST', { name: 'Pasta', sku: 'INV-PST', unit: 'kg', currentStock: 20, minimumStock: 5, costPrice: 150 }, token);
  }

  if (!cust.data.length) {
    console.log('Seeding Customers...');
    await doFetch('/customers', 'POST', { name: 'Alice Smith', phone: '9876543210', email: 'alice@example.com' }, token);
  }

  console.log('Audit completed.');
}

runAudit().catch(console.error);
