const { ClassSession } = require('../entities');

module.exports = {
  async create(req, res) {
    try {
      const session = await ClassSession.create(req.body);
      res.status(201).json(session);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async getAll(req, res) {
    try {
      const sessions = await ClassSession.findAll();
      res.json(sessions);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async getById(req, res) {
    try {
      const session = await ClassSession.findByPk(req.params.id);
      if (!session) return res.status(404).json({ error: 'Not found' });
      res.json(session);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async update(req, res) {
    try {
      const session = await ClassSession.findByPk(req.params.id);
      if (!session) return res.status(404).json({ error: 'Not found' });
      await session.update(req.body);
      res.json(session);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async delete(req, res) {
    try {
      const session = await ClassSession.findByPk(req.params.id);
      if (!session) return res.status(404).json({ error: 'Not found' });
      await session.destroy();
      res.status(204).end();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
