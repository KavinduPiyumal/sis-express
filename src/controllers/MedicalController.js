const { Medical } = require('../entities');

module.exports = {
  async create(req, res) {
    try {
      const medical = await Medical.create(req.body);
      res.status(201).json(medical);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async getAll(req, res) {
    try {
      const medicals = await Medical.findAll();
      res.json(medicals);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async getById(req, res) {
    try {
      const medical = await Medical.findByPk(req.params.id);
      if (!medical) return res.status(404).json({ error: 'Not found' });
      res.json(medical);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async update(req, res) {
    try {
      const medical = await Medical.findByPk(req.params.id);
      if (!medical) return res.status(404).json({ error: 'Not found' });
      await medical.update(req.body);
      res.json(medical);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async delete(req, res) {
    try {
      const medical = await Medical.findByPk(req.params.id);
      if (!medical) return res.status(404).json({ error: 'Not found' });
      await medical.destroy();
      res.status(204).end();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
