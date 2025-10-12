const express = require('express');
const router = express.Router();
const FileUploadController = require('../controllers/FileUploadController');
const authenticate = require('../middlewares/auth');
const { requireAnyRole } = require('../middlewares/authorize');
const auditLogger = require('../middlewares/auditLogger');

const fileUploadController = new FileUploadController();

// Apply authentication to all routes
router.use(authenticate);

// POST /api/files/upload - File Upload
router.post('/upload',
  requireAnyRole,
  auditLogger('upload', 'file'),
  async (req, res) => {
    await fileUploadController.uploadFiles(req, res);
  }
);

// GET /api/files/download/:fileId - File Download
router.get('/download/:fileId',
  requireAnyRole,
  async (req, res) => {
    await fileUploadController.downloadFile(req, res);
  }
);

// DELETE /api/files/:fileId - Delete File
router.delete('/:fileId',
  requireAnyRole,
  auditLogger('delete', 'file'),
  async (req, res) => {
    await fileUploadController.deleteFile(req, res);
  }
);

module.exports = router;