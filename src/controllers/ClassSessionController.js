
const ClassSessionUseCase = require('../usecases/ClassSessionUseCase');
const useCase = new ClassSessionUseCase();

module.exports = {
  async create(req, res) {
    try {
      const session = await useCase.createClassSession(req.body);
      res.status(201).json({
        success: true,
        message: 'Class session created successfully',
        data: session
      });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },
  async getAll(req, res) {
    try {
      const sessions = await useCase.getAllClassSessions();
      res.json({
        success: true,
        data: sessions
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },
  async getById(req, res) {
    try {
      const session = await useCase.getClassSessionById(req.params.id);
      res.json({
        success: true,
        data: session
      });
    } catch (err) {
      if (err.message === 'Class session not found') {
        return res.status(404).json({ success: false, message: 'Not found' });
      }
      res.status(500).json({ success: false, message: err.message });
    }
  },
  async update(req, res) {
    try {
      const session = await useCase.updateClassSession(req.params.id, req.body);
      res.json({
        success: true,
        message: 'Class session updated successfully',
        data: session
      });
    } catch (err) {
      if (err.message === 'Class session not found') {
        return res.status(404).json({ success: false, message: 'Not found' });
      }
      res.status(400).json({ success: false, message: err.message });
    }
  },
  async delete(req, res) {
    try {
      await useCase.deleteClassSession(req.params.id);
      res.json({
        success: true,
        message: 'Class session deleted successfully'
      });
    } catch (err) {
      if (err.message === 'Class session not found') {
        return res.status(404).json({ success: false, message: 'Not found' });
      }
      res.status(500).json({ success: false, message: err.message });
    }
  }
};
