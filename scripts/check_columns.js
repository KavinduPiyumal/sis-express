const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  try {
    const res = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'Payment' AND column_name = 'feeTypeId';
    `);
    console.log('column check result:', res);
  } catch (e) {
    console.error('error checking columns:', e.message || e);
  } finally {
    await prisma.$disconnect();
  }
})();
