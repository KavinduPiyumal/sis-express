
const prisma = require('../infrastructure/prisma');

module.exports = {
  async create(req, res) {
    try {
      const department = await prisma.department.create({ data: req.body });
      res.status(201).json(department);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async getAll(req, res) {
    try {
      const departments = await prisma.department.findMany();
      res.json(departments);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async getById(req, res) {
    try {
      const department = await prisma.department.findUnique({ where: { id: req.params.id } });
      if (!department) return res.status(404).json({ error: 'Not found' });
      res.json(department);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async update(req, res) {
    try {
      const department = await prisma.department.update({ where: { id: req.params.id }, data: req.body });
      res.json(department);
    } catch (err) {
      if (err.code === 'P2025') return res.status(404).json({ error: 'Not found' });
      res.status(400).json({ error: err.message });
    }
  },
  async delete(req, res) {
    try {
      await prisma.department.delete({ where: { id: req.params.id } });
      res.status(204).end();
    } catch (err) {
      if (err.code === 'P2025') return res.status(404).json({ error: 'Not found' });
      res.status(500).json({ error: err.message });
    }
  }
};
