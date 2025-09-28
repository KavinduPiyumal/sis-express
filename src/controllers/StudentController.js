
const prisma = require('../infrastructure/prisma');

module.exports = {
  // create method removed; use user creation route
  async getAll(req, res) {
    try {
      const students = await prisma.student.findMany();
      res.json(students);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async getById(req, res) {
    try {
      const student = await prisma.student.findUnique({ where: { id: req.params.id } });
      if (!student) return res.status(404).json({ error: 'Not found' });
      res.json(student);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async update(req, res) {
    try {
      const student = await prisma.student.update({ where: { id: req.params.id }, data: req.body });
      res.json(student);
    } catch (err) {
      if (err.code === 'P2025') return res.status(404).json({ error: 'Not found' });
      res.status(400).json({ error: err.message });
    }
  },
  async delete(req, res) {
    try {
      await prisma.student.delete({ where: { id: req.params.id } });
      res.status(204).end();
    } catch (err) {
      if (err.code === 'P2025') return res.status(404).json({ error: 'Not found' });
      res.status(500).json({ error: err.message });
    }
  }
};
