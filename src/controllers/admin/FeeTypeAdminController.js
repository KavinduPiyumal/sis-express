const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { FeeTypeCreateDTO, FeeTypeListQueryDTO } = require('../../dto/FeeTypeDTO');

class FeeTypeAdminController {
  constructor() {}

  // GET /api/admin/fee-types
  async list(req, res) {
    try {
      // If Prisma model isn't available yet (migration not applied), return a safe fallback
      if (!prisma || !prisma.feeType) {
        return res.status(200).json({ success: true, data: { feeTypes: [], page: 1, perPage: 0, total: 0 }, warning: 'Prisma model `feeType` is not available. Run `npx prisma migrate dev --name add_fee_type && npx prisma generate` to apply migration and regenerate Prisma Client.' });
      }
      const dto = new FeeTypeListQueryDTO(req.query);
      const v = dto.validate();
      if (!v.isValid) return res.status(400).json({ success: false, message: 'Validation failed', errors: v.errors });

      const where = {};
      if (dto.active === true) where.isActive = true;
      if (dto.active === false) where.isActive = false;
      if (dto.q) where.OR = [{ name: { contains: dto.q, mode: 'insensitive' } }, { code: { contains: dto.q, mode: 'insensitive' } }];

      const total = await prisma.feeType.count({ where });
      const items = await prisma.feeType.findMany({ where, skip: (dto.page - 1) * dto.perPage, take: dto.perPage, orderBy: { createdAt: 'desc' } });

      return res.status(200).json({ success: true, data: { feeTypes: items, page: dto.page, perPage: dto.perPage, total } });
    } catch (error) {
      console.error('FeeType list error', error);
      if (error && error.message && error.message.includes('Prisma model `feeType`')) {
        return res.status(503).json({ success: false, message: error.message });
      }
      return res.status(500).json({ success: false, message: 'Failed to list fee types', error: error.message });
    }
  }

  // POST /api/admin/fee-types
  async create(req, res) {
    try {
      if (!prisma || !prisma.feeType) {
        return res.status(503).json({ success: false, message: 'Prisma model `feeType` is not available. Run `npx prisma migrate dev --name add_fee_type && npx prisma generate` to apply migration and regenerate Prisma Client.' });
      }
      const dto = new FeeTypeCreateDTO(req.body);
      const v = dto.validate();
      if (!v.isValid) return res.status(400).json({ success: false, message: 'Validation failed', errors: v.errors });

      // unique name or code
      const existing = await prisma.feeType.findFirst({ where: { OR: [{ name: dto.name }, dto.code ? { code: dto.code } : undefined].filter(Boolean) } });
      if (existing) return res.status(409).json({ success: false, message: 'Fee type with same name or code exists' });

      const created = await prisma.feeType.create({ data: { name: dto.name, defaultAmount: dto.defaultAmount || 0, code: dto.code, description: dto.description, isActive: dto.isActive, createdBy: req.user && req.user.id ? req.user.id : null } });
      return res.status(201).json({ success: true, data: created });
    } catch (error) {
      console.error('FeeType create error', error);
      if (error && error.message && error.message.includes('Prisma model `feeType`')) {
        return res.status(503).json({ success: false, message: error.message });
      }
      return res.status(500).json({ success: false, message: 'Failed to create fee type', error: error.message });
    }
  }

  // GET /api/admin/fee-types/:id
  async get(req, res) {
    try {
      if (!prisma || !prisma.feeType) {
        return res.status(503).json({ success: false, message: 'Prisma model `feeType` is not available. Run `npx prisma migrate dev --name add_fee_type && npx prisma generate` to apply migration and regenerate Prisma Client.' });
      }
      const { feeTypeId } = req.params;
      const item = await prisma.feeType.findUnique({ where: { id: feeTypeId } });
      if (!item) return res.status(404).json({ success: false, message: 'Fee type not found' });
      return res.status(200).json({ success: true, data: item });
    } catch (error) {
      console.error('FeeType get error', error);
      if (error && error.message && error.message.includes('Prisma model `feeType`')) {
        return res.status(503).json({ success: false, message: error.message });
      }
      return res.status(500).json({ success: false, message: 'Failed to get fee type', error: error.message });
    }
  }

  // PUT /api/admin/fee-types/:id
  async update(req, res) {
    try {
      if (!prisma || !prisma.feeType) {
        return res.status(503).json({ success: false, message: 'Prisma model `feeType` is not available. Run `npx prisma migrate dev --name add_fee_type && npx prisma generate` to apply migration and regenerate Prisma Client.' });
      }
      const { feeTypeId } = req.params;
      const dto = new FeeTypeCreateDTO(req.body);
      const v = dto.validate();
      if (!v.isValid) return res.status(400).json({ success: false, message: 'Validation failed', errors: v.errors });

      const item = await prisma.feeType.findUnique({ where: { id: feeTypeId } });
      if (!item) return res.status(404).json({ success: false, message: 'Fee type not found' });

      // check uniqueness if name/code changed
      if (dto.name !== item.name || (dto.code && dto.code !== item.code)) {
        const conflict = await prisma.feeType.findFirst({ where: { OR: [{ name: dto.name }, dto.code ? { code: dto.code } : undefined].filter(Boolean), id: { not: feeTypeId } } });
        if (conflict) return res.status(409).json({ success: false, message: 'Fee type with same name or code exists' });
      }

      const updated = await prisma.feeType.update({ where: { id: feeTypeId }, data: { name: dto.name, defaultAmount: dto.defaultAmount || 0, code: dto.code, description: dto.description, isActive: dto.isActive, updatedAt: new Date() } });
      return res.status(200).json({ success: true, data: updated });
    } catch (error) {
      console.error('FeeType update error', error);
      if (error && error.message && error.message.includes('Prisma model `feeType`')) {
        return res.status(503).json({ success: false, message: error.message });
      }
      return res.status(500).json({ success: false, message: 'Failed to update fee type', error: error.message });
    }
  }

  // DELETE /api/admin/fee-types/:id
  async delete(req, res) {
    try {
      if (!prisma || !prisma.feeType) {
        return res.status(503).json({ success: false, message: 'Prisma model `feeType` is not available. Run `npx prisma migrate dev --name add_fee_type && npx prisma generate` to apply migration and regenerate Prisma Client.' });
      }
      const { feeTypeId } = req.params;
      const item = await prisma.feeType.findUnique({ where: { id: feeTypeId } });
      if (!item) return res.status(404).json({ success: false, message: 'Fee type not found' });

      // soft-delete: mark isActive = false
      const updated = await prisma.feeType.update({ where: { id: feeTypeId }, data: { isActive: false, updatedAt: new Date() } });
      return res.status(204).send();
    } catch (error) {
      console.error('FeeType delete error', error);
      if (error && error.message && error.message.includes('Prisma model `feeType`')) {
        return res.status(503).json({ success: false, message: error.message });
      }
      return res.status(500).json({ success: false, message: 'Failed to delete fee type', error: error.message });
    }
  }

  // DELETE /api/admin/fee-types/:id/hard  (permanent hard delete)
  async hardDelete(req, res) {
    try {
      if (!prisma || !prisma.feeType) {
        return res.status(503).json({ success: false, message: 'Prisma model `feeType` is not available. Run `npx prisma migrate dev --name add_fee_type && npx prisma generate` to apply migration and regenerate Prisma Client.' });
      }
      const { feeTypeId } = req.params;
      const item = await prisma.feeType.findUnique({ where: { id: feeTypeId } });
      if (!item) return res.status(404).json({ success: false, message: 'Fee type not found' });

      // Attempt hard delete. If there are FK references (e.g., payments), Prisma will throw a P2003 error.
      await prisma.feeType.delete({ where: { id: feeTypeId } });
      return res.status(200).json({ success: true, message: 'Fee type permanently deleted' });
    } catch (error) {
      console.error('FeeType hard delete error', error);
      // Foreign key constraint
      if (error && error.code === 'P2003') {
        return res.status(409).json({ success: false, message: 'Cannot hard delete fee type because it is referenced by other records (for example: payments). Remove those references first or delete associated records.' });
      }
      if (error && error.code === 'P2025') {
        return res.status(404).json({ success: false, message: 'Fee type not found' });
      }
      if (error && error.message && error.message.includes('Prisma model `feeType`')) {
        return res.status(503).json({ success: false, message: error.message });
      }
      return res.status(500).json({ success: false, message: 'Failed to hard delete fee type', error: error.message });
    }
  }
}

module.exports = FeeTypeAdminController;
