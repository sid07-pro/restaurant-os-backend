async function fetchAPI(url, token) {
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error(await res.text());
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

  const customers = await fetchAPI(`${API_URL}/customers`, accessToken);
  const reservations = await fetchAPI(`${API_URL}/reservations`, accessToken);
  const tables = await fetchAPI(`${API_URL}/tables`, accessToken);
  const menuItems = await fetchAPI(`${API_URL}/menu-items`, accessToken);
  const orders = await fetchAPI(`${API_URL}/orders`, accessToken);

  console.log(`--- CURRENT API COUNTS ---`);
  console.log(`Customers: ${customers.length}`);
  console.log(`Reservations: ${reservations.length}`);
  console.log(`Orders: ${orders.length}`);
  console.log(`Tables: ${tables.length}`);
  console.log(`Menu Items: ${menuItems.length}`);
  console.log(`-------------------------`);
}

main().catch(console.error);
