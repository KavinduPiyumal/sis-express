const { Batch } = require('../entities');

module.exports = {
  async create(req, res) {
    try {
      const batch = await Batch.create(req.body);
      res.status(201).json(batch);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async getAll(req, res) {
    try {
      const batches = await Batch.findAll();
      res.json(batches);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async getById(req, res) {
    try {
      const batch = await Batch.findByPk(req.params.id);
      if (!batch) return res.status(404).json({ error: 'Not found' });
      res.json(batch);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async update(req, res) {
    try {
      const batch = await Batch.findByPk(req.params.id);
      if (!batch) return res.status(404).json({ error: 'Not found' });
      await batch.update(req.body);
      res.json(batch);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async delete(req, res) {
    try {
      const batch = await Batch.findByPk(req.params.id);
      if (!batch) return res.status(404).json({ error: 'Not found' });
      await batch.destroy();
      res.status(204).end();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
