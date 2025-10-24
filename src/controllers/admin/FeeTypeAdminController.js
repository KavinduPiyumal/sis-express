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
      const items = await prisma.feeType.findMany({
        where,
        skip: (dto.page - 1) * dto.perPage,
        take: dto.perPage,
        orderBy: { createdAt: 'desc' },
        include: {
          batch: true,
          semester: { include: { batch: true } }
        }
      });

      // Map to include batch and semester (with batch) as required
      const feeTypes = items.map(f => ({
        ...f,
        batch: f.batchId && f.batch ? { id: f.batch.id, name: f.batch.name } : null,
        semester: f.semesterId && f.semester ? {
          id: f.semester.id,
          name: f.semester.name,
          batch: f.semester.batch ? { id: f.semester.batch.id, name: f.semester.batch.name } : null
        } : null
      }));

      return res.status(200).json({ success: true, data: { feeTypes, page: dto.page, perPage: dto.perPage, total } });
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

      // Prepare data for creation, including dueDate if present
      const data = {
        name: dto.name,
        defaultAmount: dto.defaultAmount || 0,
        code: dto.code,
        description: dto.description,
        isActive: dto.isActive,
        type: dto.type,
        batchId: dto.type === 'batchwise' ? dto.batchId : null,
        semesterId: dto.type === 'semesterwise' ? dto.semesterId : null,
        createdBy: req.user && req.user.id ? req.user.id : null
      };
      if (req.body.dueDate) {
        data.dueDate = new Date(req.body.dueDate);
      }
      const created = await prisma.feeType.create({ data });
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
      const item = await prisma.feeType.findUnique({
        where: { id: feeTypeId },
        include: {
          batch: true,
          semester: { include: { batch: true } }
        }
      });
      if (!item) return res.status(404).json({ success: false, message: 'Fee type not found' });
      // Map to include batch and semester (with batch) as in list
      const data = {
        ...item,
        batch: item.batchId && item.batch ? { id: item.batch.id, name: item.batch.name } : null,
        semester: item.semesterId && item.semester ? {
          id: item.semester.id,
          name: item.semester.name,
          batch: item.semester.batch ? { id: item.semester.batch.id, name: item.semester.batch.name } : null
        } : null
      };
      return res.status(200).json({ success: true, data });
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
      const item = await prisma.feeType.findUnique({
        where: { id: feeTypeId },
        include: {
          batch: true,
          semester: { include: { batch: true } }
        }
      });
      if (!item) return res.status(404).json({ success: false, message: 'Fee type not found' });

      // Only validate fields present in req.body (partial update)
      const allowedFields = ['name', 'defaultAmount', 'code', 'description', 'isActive', 'type', 'batchId', 'semesterId', 'dueDate'];
      const updateData = {};
      for (const key of allowedFields) {
        if (Object.prototype.hasOwnProperty.call(req.body, key)) {
          updateData[key] = req.body[key];
        }
      }

      // If type is present, adjust batchId/semesterId logic
      if (updateData.type) {
        if (updateData.type === 'batchwise') {
          updateData.batchId = req.body.batchId || null;
          updateData.semesterId = null;
        } else if (updateData.type === 'semesterwise') {
          updateData.semesterId = req.body.semesterId || null;
          updateData.batchId = null;
        } else {
          updateData.batchId = null;
          updateData.semesterId = null;
        }
      }

      // Uniqueness check if name or code is being updated
      if ((updateData.name && updateData.name !== item.name) || (updateData.code && updateData.code !== item.code)) {
        const conflict = await prisma.feeType.findFirst({
          where: {
            OR: [
              updateData.name ? { name: updateData.name } : undefined,
              updateData.code ? { code: updateData.code } : undefined
            ].filter(Boolean),
            id: { not: feeTypeId }
          }
        });
        if (conflict) return res.status(409).json({ success: false, message: 'Fee type with same name or code exists' });
      }

      // If nothing to update, return current item (with mapped batch/semester)
      if (Object.keys(updateData).length === 0) {
        const data = {
          ...item,
          batch: item.batchId && item.batch ? { id: item.batch.id, name: item.batch.name } : null,
          semester: item.semesterId && item.semester ? {
            id: item.semester.id,
            name: item.semester.name,
            batch: item.semester.batch ? { id: item.semester.batch.id, name: item.semester.batch.name } : null
          } : null
        };
        return res.status(200).json({ success: true, data });
      }

      updateData.updatedAt = new Date();
      // Convert dueDate to Date object if present and not null
      if (updateData.hasOwnProperty('dueDate') && updateData.dueDate) {
        updateData.dueDate = new Date(updateData.dueDate);
      }

      const updated = await prisma.feeType.update({
        where: { id: feeTypeId },
        data: updateData,
        include: {
          batch: true,
          semester: { include: { batch: true } }
        }
      });
      const data = {
        ...updated,
        batch: updated.batchId && updated.batch ? { id: updated.batch.id, name: updated.batch.name } : null,
        semester: updated.semesterId && updated.semester ? {
          id: updated.semester.id,
          name: updated.semester.name,
          batch: updated.semester.batch ? { id: updated.semester.batch.id, name: updated.semester.batch.name } : null
        } : null
      };
      return res.status(200).json({ success: true, data });
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
      const item = await prisma.feeType.findUnique({
        where: { id: feeTypeId },
        include: {
          batch: true,
          semester: { include: { batch: true } }
        }
      });
      if (!item) return res.status(404).json({ success: false, message: 'Fee type not found' });

      // soft-delete: mark isActive = false
      const updated = await prisma.feeType.update({
        where: { id: feeTypeId },
        data: { isActive: false, updatedAt: new Date() },
        include: {
          batch: true,
          semester: { include: { batch: true } }
        }
      });
      const data = {
        ...updated,
        batch: updated.batchId && updated.batch ? { id: updated.batch.id, name: updated.batch.name } : null,
        semester: updated.semesterId && updated.semester ? {
          id: updated.semester.id,
          name: updated.semester.name,
          batch: updated.semester.batch ? { id: updated.semester.batch.id, name: updated.semester.batch.name } : null
        } : null
      };
      return res.status(200).json({ success: true, data });
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
      const item = await prisma.feeType.findUnique({
        where: { id: feeTypeId },
        include: {
          batch: true,
          semester: { include: { batch: true } }
        }
      });
      if (!item) return res.status(404).json({ success: false, message: 'Fee type not found' });

      // Attempt hard delete. If there are FK references (e.g., payments), Prisma will throw a P2003 error.
      await prisma.feeType.delete({ where: { id: feeTypeId } });
      // Return the deleted record's info (with batch/semester) for confirmation
      const data = {
        ...item,
        batch: item.batchId && item.batch ? { id: item.batch.id, name: item.batch.name } : null,
        semester: item.semesterId && item.semester ? {
          id: item.semester.id,
          name: item.semester.name,
          batch: item.semester.batch ? { id: item.semester.batch.id, name: item.semester.batch.name } : null
        } : null
      };
      return res.status(200).json({ success: true, message: 'Fee type permanently deleted', data });
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
