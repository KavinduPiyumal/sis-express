const { CourseOffering } = require('../entities');

module.exports = {
  async create(req, res) {
    try {
      const offering = await CourseOffering.create(req.body);
      res.status(201).json(offering);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async getAll(req, res) {
    try {
      const offerings = await CourseOffering.findAll();
      res.json(offerings);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async getById(req, res) {
    try {
      const offering = await CourseOffering.findByPk(req.params.id);
      if (!offering) return res.status(404).json({ error: 'Not found' });
      res.json(offering);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async update(req, res) {
    try {
      const offering = await CourseOffering.findByPk(req.params.id);
      if (!offering) return res.status(404).json({ error: 'Not found' });
      await offering.update(req.body);
      res.json(offering);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async delete(req, res) {
    try {
      const offering = await CourseOffering.findByPk(req.params.id);
      if (!offering) return res.status(404).json({ error: 'Not found' });
      await offering.destroy();
      res.status(204).end();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
