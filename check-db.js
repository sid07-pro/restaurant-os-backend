const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({});

async function main() {
  const customerCount = await prisma.customer.count();
  const reservationCount = await prisma.reservation.count();
  const orderCount = await prisma.order.count();
  const tableCount = await prisma.table.count();
  const menuItemCount = await prisma.menuItem.count();

  console.log(`--- CURRENT DB COUNTS ---`);
  console.log(`Customers: ${customerCount}`);
  console.log(`Reservations: ${reservationCount}`);
  console.log(`Orders: ${orderCount}`);
  console.log(`Tables: ${tableCount}`);
  console.log(`Menu Items: ${menuItemCount}`);
  console.log(`-------------------------`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
