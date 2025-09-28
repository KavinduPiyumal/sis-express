
const prisma = require('../infrastructure/prisma');

module.exports = {
  async create(req, res) {
    try {
      const batch = await prisma.batch.create({ data: req.body });
      res.status(201).json(batch);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async getAll(req, res) {
    try {
      const batches = await prisma.batch.findMany();
      res.json({
        success: true,
        data: batches
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async getById(req, res) {
    try {
      const batch = await prisma.batch.findUnique({ where: { id: req.params.id } });
      if (!batch) return res.status(404).json({ error: 'Not found' });
      res.json(batch);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async update(req, res) {
    try {
      const batch = await prisma.batch.update({ where: { id: req.params.id }, data: req.body });
      res.json(batch);
    } catch (err) {
      if (err.code === 'P2025') return res.status(404).json({ error: 'Not found' });
      res.status(400).json({ error: err.message });
    }
  },
  async delete(req, res) {
    try {
      await prisma.batch.delete({ where: { id: req.params.id } });
      res.status(204).end();
    } catch (err) {
      if (err.code === 'P2025') return res.status(404).json({ error: 'Not found' });
      res.status(500).json({ error: err.message });
    }
  }
};
