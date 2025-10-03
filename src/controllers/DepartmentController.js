
const prisma = require('../infrastructure/prisma');

module.exports = {
  async create(req, res) {
    try {
      const department = await prisma.department.create({ data: req.body });
      res.status(201).json({ success: true, data: department });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  },
  async getAll(req, res) {
    try {
      const departments = await prisma.department.findMany();
      res.json({ success: true, data: departments });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },
  async getById(req, res) {
    try {
      const department = await prisma.department.findUnique({ where: { id: req.params.id } });
      if (!department) return res.status(404).json({ success: false, error: 'Not found' });
      res.json({ success: true, data: department });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },
  async update(req, res) {
    try {
      const department = await prisma.department.update({ where: { id: req.params.id }, data: req.body });
      res.json({ success: true, data: department });
    } catch (err) {
      if (err.code === 'P2025') return res.status(404).json({ success: false, error: 'Not found' });
      res.status(400).json({ success: false, error: err.message });
    }
  },
  async delete(req, res) {
    try {
      await prisma.department.delete({ where: { id: req.params.id } });
      res.json({ success: true, message: 'Department deleted successfully' });
    } catch (err) {
      if (err.code === 'P2025') return res.status(404).json({ success: false, error: 'Not found' });
      res.status(500).json({ success: false, error: err.message });
    }
  }
};
