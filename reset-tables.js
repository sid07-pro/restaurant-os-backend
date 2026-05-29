const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.table.updateMany({
    data: { status: 'AVAILABLE' }
  });
  console.log('Tables reset to AVAILABLE');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
