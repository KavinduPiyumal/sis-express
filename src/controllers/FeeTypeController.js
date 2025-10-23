const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class FeeTypeController {
  constructor() {}

  // GET /api/fee-types (public or student)
  async list(req, res) {
    try {
      // If Prisma model isn't available yet (migration not applied), return an empty list + warning
      if (!prisma || !prisma.feeType) {
        return res.status(200).json({ success: true, data: { feeTypes: [] }, warning: 'Prisma model `feeType` is not available. Run `npx prisma migrate dev --name add_fee_type && npx prisma generate` to apply migration and regenerate Prisma Client.' });
      }
      const onlyActive = req.query.onlyActive === 'true' || req.query.onlyActive === true;
      const where = {};
      if (onlyActive) where.isActive = true;
      const items = await prisma.feeType.findMany({ where, orderBy: { name: 'asc' } });
      return res.status(200).json({ success: true, data: { feeTypes: items } });
    } catch (error) {
      console.error('Public fee types list error', error);
      if (error && error.message && error.message.includes('Prisma model `feeType`')) {
        return res.status(503).json({ success: false, message: error.message });
      }
      return res.status(500).json({ success: false, message: 'Failed to list fee types', error: error.message });
    }
  }
}

module.exports = FeeTypeController;
