
const ClassSessionUseCase = require('../usecases/ClassSessionUseCase');
const useCase = new ClassSessionUseCase();

module.exports = {
  async create(req, res) {
    try {
      const session = await useCase.createClassSession(req.body);
      res.status(201).json(session);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async getAll(req, res) {
    try {
      const sessions = await useCase.getAllClassSessions();
      res.json(sessions);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async getById(req, res) {
    try {
      const session = await useCase.getClassSessionById(req.params.id);
      res.json(session);
    } catch (err) {
      if (err.message === 'Class session not found') {
        return res.status(404).json({ error: 'Not found' });
      }
      res.status(500).json({ error: err.message });
    }
  },
  async update(req, res) {
    try {
      const session = await useCase.updateClassSession(req.params.id, req.body);
      res.json(session);
    } catch (err) {
      if (err.message === 'Class session not found') {
        return res.status(404).json({ error: 'Not found' });
      }
      res.status(400).json({ error: err.message });
    }
  },
  async delete(req, res) {
    try {
      await useCase.deleteClassSession(req.params.id);
      res.status(204).end();
    } catch (err) {
      if (err.message === 'Class session not found') {
        return res.status(404).json({ error: 'Not found' });
      }
      res.status(500).json({ error: err.message });
    }
  }
};
