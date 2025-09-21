const { Student } = require('../entities');

module.exports = {
  // create method removed; use user creation route
  async getAll(req, res) {
    try {
      const students = await Student.findAll();
      res.json(students);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async getById(req, res) {
    try {
      const student = await Student.findByPk(req.params.id);
      if (!student) return res.status(404).json({ error: 'Not found' });
      res.json(student);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async update(req, res) {
    try {
      const student = await Student.findByPk(req.params.id);
      if (!student) return res.status(404).json({ error: 'Not found' });
      await student.update(req.body);
      res.json(student);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async delete(req, res) {
    try {
      const student = await Student.findByPk(req.params.id);
      if (!student) return res.status(404).json({ error: 'Not found' });
      await student.destroy();
      res.status(204).end();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
