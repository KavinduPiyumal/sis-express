const { Department } = require('../entities');

module.exports = {
  async create(req, res) {
    try {
      const department = await Department.create(req.body);
      res.status(201).json(department);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async getAll(req, res) {
    try {
      const departments = await Department.findAll();
      res.json(departments);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async getById(req, res) {
    try {
      const department = await Department.findByPk(req.params.id);
      if (!department) return res.status(404).json({ error: 'Not found' });
      res.json(department);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async update(req, res) {
    try {
      const department = await Department.findByPk(req.params.id);
      if (!department) return res.status(404).json({ error: 'Not found' });
      await department.update(req.body);
      res.json(department);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async delete(req, res) {
    try {
      const department = await Department.findByPk(req.params.id);
      if (!department) return res.status(404).json({ error: 'Not found' });
      await department.destroy();
      res.status(204).end();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
