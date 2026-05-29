const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- SEEDING DATABASE FOR INVESTOR DEMO ---');

  // 1. Tables (10 Tables)
  console.log('Seeding 10 Tables...');
  const tableNames = ['T1 (Window)', 'T2 (Window)', 'T3', 'T4', 'T5', 'T6', 'B1 (Booth)', 'B2 (Booth)', 'B3 (Booth)', 'VIP 1'];
  const tables = [];
  for (let i = 0; i < tableNames.length; i++) {
    const t = await prisma.table.create({
      data: {
        tableNumber: `T${i + 1}`,
        name: tableNames[i],
        capacity: i < 6 ? 4 : (i < 9 ? 6 : 8),
        status: 'AVAILABLE'
      }
    });
    tables.push(t);
  }

  // 2. Categories (5 Categories)
  console.log('Seeding 5 Categories...');
  const catNames = ['Starters', 'Mains', 'Desserts', 'Beverages', 'Specials'];
  const categories = [];
  for (const name of catNames) {
    const c = await prisma.category.create({
      data: { name }
    });
    categories.push(c);
  }

  // 3. Menu Items (25+ items)
  console.log('Seeding 25+ Menu Items...');
  const menuData = [
    { name: 'Paneer Tikka', price: 250, cat: 0, type: 'VEG' },
    { name: 'Chicken 65', price: 300, cat: 0, type: 'NON_VEG' },
    { name: 'Gobi Manchurian', price: 200, cat: 0, type: 'VEG' },
    { name: 'Fish Fingers', price: 350, cat: 0, type: 'NON_VEG' },
    { name: 'Crispy Corn', price: 180, cat: 0, type: 'VEG' },
    { name: 'Butter Chicken', price: 450, cat: 1, type: 'NON_VEG' },
    { name: 'Dal Makhani', price: 280, cat: 1, type: 'VEG' },
    { name: 'Garlic Naan', price: 60, cat: 1, type: 'VEG' },
    { name: 'Mutton Biryani', price: 550, cat: 1, type: 'NON_VEG' },
    { name: 'Veg Pulao', price: 220, cat: 1, type: 'VEG' },
    { name: 'Gulab Jamun', price: 120, cat: 2, type: 'VEG' },
    { name: 'Rasmalai', price: 150, cat: 2, type: 'VEG' },
    { name: 'Chocolate Brownie', price: 200, cat: 2, type: 'VEG' },
    { name: 'Ice Cream', price: 100, cat: 2, type: 'VEG' },
    { name: 'Cheesecake', price: 250, cat: 2, type: 'VEG' },
    { name: 'Masala Chai', price: 50, cat: 3, type: 'VEG' },
    { name: 'Cold Coffee', price: 150, cat: 3, type: 'VEG' },
    { name: 'Fresh Lime Soda', price: 80, cat: 3, type: 'VEG' },
    { name: 'Mango Lassi', price: 120, cat: 3, type: 'VEG' },
    { name: 'Virgin Mojito', price: 180, cat: 3, type: 'VEG' },
    { name: 'Chef Special Kebab', price: 400, cat: 4, type: 'NON_VEG' },
    { name: 'Lobster Thermidor', price: 1200, cat: 4, type: 'NON_VEG' },
    { name: 'Truffle Mushroom Risotto', price: 500, cat: 4, type: 'VEG' },
    { name: 'Sizzling Brownie', price: 250, cat: 4, type: 'VEG' },
    { name: 'Avocado Toast', price: 280, cat: 4, type: 'VEG' },
  ];

  const menuItems = [];
  for (const item of menuData) {
    const m = await prisma.menuItem.create({
      data: {
        name: item.name,
        price: item.price,
        categoryId: categories[item.cat].id,
        isAvailable: true,
        dietaryType: item.type
      }
    });
    menuItems.push(m);
  }

  // 4. Customers (15 Customers)
  console.log('Seeding 15 Customers...');
  const customerNames = [
    'Amit Sharma', 'Priya Patel', 'Rahul Singh', 'Sneha Gupta', 'Vikram Verma',
    'Anjali Desai', 'Rohan Mehta', 'Neha Joshi', 'Karan Malhotra', 'Pooja Reddy',
    'Arjun Kapoor', 'Kavita Das', 'Sanjay Kumar', 'Riya Sen', 'Manoj Tiwari'
  ];
  const customers = [];
  for (let i = 0; i < customerNames.length; i++) {
    const c = await prisma.customer.create({
      data: {
        name: customerNames[i],
        phone: `98765432${i.toString().padStart(2, '0')}`,
        email: `customer${i}@example.com`,
        totalVisits: Math.floor(Math.random() * 25),
        loyaltyPoints: Math.floor(Math.random() * 500)
      }
    });
    customers.push(c);
  }

  // 5. Reservations (10 Reservations)
  console.log('Seeding 10 Reservations...');
  for (let i = 0; i < 10; i++) {
    const d = new Date();
    d.setHours(d.getHours() + i + 1);
    await prisma.reservation.create({
      data: {
        customerId: customers[i].id,
        tableId: tables[i].id,
        reservationTime: d,
        guestCount: Math.floor(Math.random() * 4) + 2,
        status: 'CONFIRMED',
        notes: 'VIP guest'
      }
    });
  }

  // 6. Inventory Items (20 Items)
  console.log('Seeding 20 Inventory Items...');
  const invItems = ['Tomatoes', 'Onions', 'Potatoes', 'Chicken Breast', 'Paneer', 'Rice', 'Flour', 'Butter', 'Milk', 'Eggs', 'Sugar', 'Salt', 'Coffee Beans', 'Tea Leaves', 'Lemons', 'Mint', 'Oil', 'Garlic', 'Ginger', 'Chilies'];
  for (const inv of invItems) {
    await prisma.inventoryItem.create({
      data: {
        name: inv,
        sku: `SKU-${inv.substring(0,3).toUpperCase()}-${Math.floor(Math.random()*1000)}`,
        category: 'RAW_MATERIAL',
        unit: 'KG',
        currentStock: Math.floor(Math.random() * 100),
        minimumStock: 20,
        costPrice: Math.floor(Math.random() * 200) + 10,
        supplier: 'Local Market'
      }
    });
  }

  // 7. Orders & Payments (15 Orders)
  console.log('Seeding 15 Orders & Payment History...');
  const statuses = ['OPEN', 'PREPARING', 'READY', 'SERVED', 'COMPLETED'];
  
  for (let i = 0; i < 15; i++) {
    const table = tables[i % tables.length];
    let subtotal = 0;
    
    const numItems = Math.floor(Math.random() * 4) + 1;
    const orderItems = [];
    for(let j = 0; j < numItems; j++) {
      const rndItem = menuItems[Math.floor(Math.random() * menuItems.length)];
      const qty = Math.floor(Math.random() * 2) + 1;
      orderItems.push({
        menuItemId: rndItem.id,
        quantity: qty,
        price: rndItem.price
      });
      subtotal += Number(rndItem.price) * qty;
    }

    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    // Create order
    const order = await prisma.order.create({
      data: {
        tableId: table.id,
        status: status,
        subtotal: subtotal,
        total: subtotal,
        orderItems: {
          create: orderItems
        }
      }
    });

    if (status === 'COMPLETED') {
      await prisma.payment.create({
        data: {
          orderId: order.id,
          amount: subtotal + 50,
          method: ['CASH', 'UPI', 'CARD'][Math.floor(Math.random() * 3)],
          status: 'SUCCESS'
        }
      });
      // Optionally release table if COMPLETED, but we want occupied tables too
      await prisma.table.update({
        where: { id: table.id },
        data: { status: 'AVAILABLE' }
      });
    } else {
      await prisma.table.update({
        where: { id: table.id },
        data: { status: 'OCCUPIED' }
      });
    }
  }

  console.log('Demo data generation complete!');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
