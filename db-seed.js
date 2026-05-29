const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- DB AUDIT ---');
  
  const userCount = await prisma.user.count();
  const tableCount = await prisma.table.count();
  const categoryCount = await prisma.category.count();
  const menuCount = await prisma.menuItem.count();
  const orderCount = await prisma.order.count();
  const inventoryCount = await prisma.inventoryItem.count();
  
  console.log(`Users: ${userCount}`);
  console.log(`Tables: ${tableCount}`);
  console.log(`Categories: ${categoryCount}`);
  console.log(`Menu Items: ${menuCount}`);
  console.log(`Orders: ${orderCount}`);
  console.log(`Inventory: ${inventoryCount}`);

  if (tableCount === 0 || categoryCount === 0 || menuCount === 0) {
    console.log('\n--- SEEDING DATABASE ---');
    
    // Seed Tables
    const t1 = await prisma.table.create({ data: { tableNumber: 'T1', name: 'Window 1', capacity: 2, status: 'AVAILABLE' } });
    const t2 = await prisma.table.create({ data: { tableNumber: 'T2', name: 'Window 2', capacity: 4, status: 'AVAILABLE' } });
    const t3 = await prisma.table.create({ data: { tableNumber: 'T3', name: 'Booth 1', capacity: 6, status: 'AVAILABLE' } });
    console.log('Seeded 3 tables');

    // Seed Categories
    const c1 = await prisma.category.create({ data: { name: 'Starters' } });
    const c2 = await prisma.category.create({ data: { name: 'Mains' } });
    const c3 = await prisma.category.create({ data: { name: 'Beverages' } });
    console.log('Seeded 3 categories');

    // Seed Menu Items
    await prisma.menuItem.create({ data: { name: 'Spring Rolls', price: 150, categoryId: c1.id, isAvailable: true } });
    await prisma.menuItem.create({ data: { name: 'Paneer Tikka', price: 250, categoryId: c1.id, isAvailable: true } });
    await prisma.menuItem.create({ data: { name: 'Butter Chicken', price: 450, categoryId: c2.id, isAvailable: true } });
    await prisma.menuItem.create({ data: { name: 'Dal Makhani', price: 300, categoryId: c2.id, isAvailable: true } });
    await prisma.menuItem.create({ data: { name: 'Fresh Lime Soda', price: 90, categoryId: c3.id, isAvailable: true } });
    console.log('Seeded 5 menu items');

    // Seed Inventory
    await prisma.inventoryItem.create({ data: { name: 'Chicken', sku: 'INV-CHK', unit: 'kg', currentStock: 50, minimumStock: 10, costPrice: 200 } });
    await prisma.inventoryItem.create({ data: { name: 'Paneer', sku: 'INV-PNR', unit: 'kg', currentStock: 20, minimumStock: 5, costPrice: 300 } });
    console.log('Seeded inventory');

    // Seed Customers
    await prisma.customer.create({ data: { name: 'John Doe', phone: '9876543210', loyaltyPoints: 100, totalVisits: 2, totalSpent: 1500 } });
    console.log('Seeded customer');
    
    console.log('Seeding complete.');
  }
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
