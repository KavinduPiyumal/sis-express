
const prisma = require('../infrastructure/prisma');

module.exports = {
  async create(req, res) {
    try {
      const medical = await prisma.medical.create({ data: req.body });
      res.status(201).json(medical);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async getAll(req, res) {
    try {
      const medicals = await prisma.medical.findMany();
      res.json(medicals);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async getById(req, res) {
    try {
      const medical = await prisma.medical.findUnique({ where: { id: req.params.id } });
      if (!medical) return res.status(404).json({ error: 'Not found' });
      res.json(medical);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async update(req, res) {
    try {
      const medical = await prisma.medical.update({ where: { id: req.params.id }, data: req.body });
      res.json(medical);
    } catch (err) {
      if (err.code === 'P2025') return res.status(404).json({ error: 'Not found' });
      res.status(400).json({ error: err.message });
    }
  },
  async delete(req, res) {
    try {
      await prisma.medical.delete({ where: { id: req.params.id } });
      res.status(204).end();
    } catch (err) {
      if (err.code === 'P2025') return res.status(404).json({ error: 'Not found' });
      res.status(500).json({ error: err.message });
    }
  }
};
