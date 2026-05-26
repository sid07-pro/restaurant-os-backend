const baseUrl = 'http://localhost:3000/api/v1';

async function run() {
  console.log('--- Testing Authentication & Tables Module ---');
  
  // 1. Login to get token
  let res = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@restaurantos.local', password: 'Admin@12345' })
  });
  const authData = await res.json();
  if (!res.ok) {
    console.error('Login failed', authData);
    return;
  }
  const token = authData.accessToken;
  console.log('Login successful.');

  // 2. Create Table
  console.log('\n--- Create Table ---');
  res = await fetch(`${baseUrl}/tables`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ tableNumber: 'T1', capacity: 4, name: 'Window 1' })
  });
  let table = await res.json();
  console.log('Create table response:', res.status, table);

  // 3. Validation: Missing tableNumber
  console.log('\n--- Validation Test: Missing TableNumber ---');
  res = await fetch(`${baseUrl}/tables`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ capacity: 4 })
  });
  console.log('Validation missing tableNumber response:', res.status, await res.json());

  // 4. Validation: Negative capacity
  console.log('\n--- Validation Test: Negative Capacity ---');
  res = await fetch(`${baseUrl}/tables`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ tableNumber: 'T2', capacity: -1 })
  });
  console.log('Validation negative capacity response:', res.status, await res.json());

  // 5. Unique tableNumber
  console.log('\n--- Validation Test: Unique TableNumber ---');
  res = await fetch(`${baseUrl}/tables`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ tableNumber: 'T1', capacity: 2 })
  });
  console.log('Validation unique tableNumber response:', res.status, await res.json());

  // 6. Get All Tables
  console.log('\n--- Get All Tables ---');
  res = await fetch(`${baseUrl}/tables`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('Get all tables response:', res.status, await res.json());

  // 7. Change Status
  console.log('\n--- Change Table Status ---');
  res = await fetch(`${baseUrl}/tables/${table.id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ status: 'OCCUPIED' })
  });
  console.log('Change status response:', res.status, await res.json());
}

run().catch(console.error);
