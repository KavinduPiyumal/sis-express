
const prisma = require('../infrastructure/prisma');

module.exports = {
  // create method removed; use user creation route
  async getAll(req, res) {
    try {
      const lecturers = await prisma.lecturer.findMany();
      res.json(lecturers);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async getById(req, res) {
    try {
      const lecturer = await prisma.lecturer.findUnique({ where: { id: req.params.id } });
      if (!lecturer) return res.status(404).json({ error: 'Not found' });
      res.json(lecturer);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async update(req, res) {
    try {
      const lecturer = await prisma.lecturer.update({ where: { id: req.params.id }, data: req.body });
      res.json(lecturer);
    } catch (err) {
      if (err.code === 'P2025') return res.status(404).json({ error: 'Not found' });
      res.status(400).json({ error: err.message });
    }
  },
  async delete(req, res) {
    try {
      await prisma.lecturer.delete({ where: { id: req.params.id } });
      res.status(204).end();
    } catch (err) {
      if (err.code === 'P2025') return res.status(404).json({ error: 'Not found' });
      res.status(500).json({ error: err.message });
    }
  }
};
