const { Lecturer } = require('../entities');

module.exports = {
  async create(req, res) {
    try {
      const lecturer = await Lecturer.create(req.body);
      res.status(201).json(lecturer);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async getAll(req, res) {
    try {
      const lecturers = await Lecturer.findAll();
      res.json(lecturers);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async getById(req, res) {
    try {
      const lecturer = await Lecturer.findByPk(req.params.id);
      if (!lecturer) return res.status(404).json({ error: 'Not found' });
      res.json(lecturer);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async update(req, res) {
    try {
      const lecturer = await Lecturer.findByPk(req.params.id);
      if (!lecturer) return res.status(404).json({ error: 'Not found' });
      await lecturer.update(req.body);
      res.json(lecturer);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async delete(req, res) {
    try {
      const lecturer = await Lecturer.findByPk(req.params.id);
      if (!lecturer) return res.status(404).json({ error: 'Not found' });
      await lecturer.destroy();
      res.status(204).end();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
