const baseUrl = 'http://localhost:3000/api/v1';

async function req(url, opts = {}) {
  const r = await fetch(url, opts);
  const text = await r.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  return { status: r.status, body };
}

async function run() {
  // ─── 1. Login ───────────────────────────────────────────────────────────────
  console.log('\n=== 1. LOGIN ===');
  let r = await req(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@restaurantos.local', password: 'Admin@12345' }),
  });
  if (!r.body.accessToken) { console.error('Login failed', r); return; }
  const token = r.body.accessToken;
  const hdrs = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
  console.log(`Status: ${r.status} – Login OK`);

  // ─── 2. Create Category ──────────────────────────────────────────────────────
  console.log('\n=== 2. CREATE CATEGORY ===');
  r = await req(`${baseUrl}/categories`, { method: 'POST', headers: hdrs,
    body: JSON.stringify({ name: 'Starters', description: 'Appetizers and snacks' }) });
  console.log(`Status: ${r.status}`, r.body);
  const catId = r.body.id;

  // ─── 3. Duplicate category (expect 409) ──────────────────────────────────────
  console.log('\n=== 3. DUPLICATE CATEGORY (expect 409) ===');
  r = await req(`${baseUrl}/categories`, { method: 'POST', headers: hdrs,
    body: JSON.stringify({ name: 'Starters' }) });
  console.log(`Status: ${r.status} – message: ${r.body.message}`);

  // ─── 4. Get all categories ───────────────────────────────────────────────────
  console.log('\n=== 4. GET ALL CATEGORIES ===');
  r = await req(`${baseUrl}/categories`, { headers: hdrs });
  console.log(`Status: ${r.status} – Count: ${r.body.length}`);

  // ─── 5. Get category by ID ───────────────────────────────────────────────────
  console.log('\n=== 5. GET CATEGORY BY ID ===');
  r = await req(`${baseUrl}/categories/${catId}`, { headers: hdrs });
  console.log(`Status: ${r.status} – name: ${r.body.name}`);

  // ─── 6. Update category ──────────────────────────────────────────────────────
  console.log('\n=== 6. UPDATE CATEGORY ===');
  r = await req(`${baseUrl}/categories/${catId}`, { method: 'PATCH', headers: hdrs,
    body: JSON.stringify({ description: 'Appetizers, snacks, and soups' }) });
  console.log(`Status: ${r.status} – description: ${r.body.description}`);

  // ─── 7. Create Menu Item ─────────────────────────────────────────────────────
  console.log('\n=== 7. CREATE MENU ITEM ===');
  r = await req(`${baseUrl}/menu-items`, { method: 'POST', headers: hdrs,
    body: JSON.stringify({ name: 'Paneer Tikka', price: 250.00, categoryId: catId,
      description: 'Grilled cottage cheese', isAvailable: true }) });
  console.log(`Status: ${r.status}`, r.body);
  const itemId = r.body.id;

  // ─── 8. Validation: price = 0 (expect 400) ───────────────────────────────────
  console.log('\n=== 8. VALIDATION: price = 0 (expect 400) ===');
  r = await req(`${baseUrl}/menu-items`, { method: 'POST', headers: hdrs,
    body: JSON.stringify({ name: 'Test', price: 0, categoryId: catId }) });
  console.log(`Status: ${r.status} – message: ${r.body.message}`);

  // ─── 9. Validation: invalid categoryId ──────────────────────────────────────
  console.log('\n=== 9. VALIDATION: bad categoryId UUID (expect 400) ===');
  r = await req(`${baseUrl}/menu-items`, { method: 'POST', headers: hdrs,
    body: JSON.stringify({ name: 'Test', price: 100, categoryId: '00000000-0000-0000-0000-000000000000' }) });
  console.log(`Status: ${r.status} – message: ${r.body.message}`);

  // ─── 10. Get all menu items ──────────────────────────────────────────────────
  console.log('\n=== 10. GET ALL MENU ITEMS ===');
  r = await req(`${baseUrl}/menu-items`, { headers: hdrs });
  console.log(`Status: ${r.status} – Count: ${r.body.length}`);

  // ─── 11. Filter by category ──────────────────────────────────────────────────
  console.log('\n=== 11. FILTER BY CATEGORY ===');
  r = await req(`${baseUrl}/menu-items?categoryId=${catId}`, { headers: hdrs });
  console.log(`Status: ${r.status} – Count: ${r.body.length}`);

  // ─── 12. Search by name ──────────────────────────────────────────────────────
  console.log('\n=== 12. SEARCH ?search=paneer ===');
  r = await req(`${baseUrl}/menu-items?search=paneer`, { headers: hdrs });
  console.log(`Status: ${r.status} – Count: ${r.body.length} – Names: ${r.body.map(i => i.name)}`);

  // ─── 13. Toggle availability ─────────────────────────────────────────────────
  console.log('\n=== 13. TOGGLE AVAILABILITY → false ===');
  r = await req(`${baseUrl}/menu-items/${itemId}/availability`, { method: 'PATCH', headers: hdrs,
    body: JSON.stringify({ isAvailable: false }) });
  console.log(`Status: ${r.status} – isAvailable: ${r.body.isAvailable}`);

  // ─── 14. Update menu item ────────────────────────────────────────────────────
  console.log('\n=== 14. UPDATE MENU ITEM price ===');
  r = await req(`${baseUrl}/menu-items/${itemId}`, { method: 'PATCH', headers: hdrs,
    body: JSON.stringify({ price: 275.50 }) });
  console.log(`Status: ${r.status} – price: ${r.body.price}`);

  // ─── 15. 404 on unknown item ─────────────────────────────────────────────────
  console.log('\n=== 15. GET MENU ITEM non-existent (expect 404) ===');
  r = await req(`${baseUrl}/menu-items/00000000-0000-0000-0000-000000000000`, { headers: hdrs });
  console.log(`Status: ${r.status} – message: ${r.body.message}`);

  // ─── 16. Delete category with items (expect 400) ────────────────────────────
  console.log('\n=== 16. DELETE CATEGORY WITH ITEMS (expect 400) ===');
  r = await req(`${baseUrl}/categories/${catId}`, { method: 'DELETE', headers: hdrs });
  console.log(`Status: ${r.status} – message: ${r.body.message}`);

  // ─── 17. Delete menu item ────────────────────────────────────────────────────
  console.log('\n=== 17. DELETE MENU ITEM ===');
  r = await req(`${baseUrl}/menu-items/${itemId}`, { method: 'DELETE', headers: hdrs });
  console.log(`Status: ${r.status}`);

  // ─── 18. Delete category (now empty) ────────────────────────────────────────
  console.log('\n=== 18. DELETE CATEGORY (empty, expect 200) ===');
  r = await req(`${baseUrl}/categories/${catId}`, { method: 'DELETE', headers: hdrs });
  console.log(`Status: ${r.status}`);

  // ─── 19. Unauthenticated request (expect 401) ───────────────────────────────
  console.log('\n=== 19. UNAUTHENTICATED (expect 401) ===');
  r = await req(`${baseUrl}/categories`, {});
  console.log(`Status: ${r.status} – message: ${r.body.message}`);

  console.log('\n✅ All tests complete.');
}

run().catch(console.error);
