const express = require('express');
const router = express.Router();
const PaymentAdminController = require('../../controllers/admin/PaymentAdminController');
const authenticate = require('../../middlewares/auth');
// optionally you may have an authorize middleware, use requireRole/requireAnyRole if available
const controller = new PaymentAdminController();

// All admin routes require authentication and then role checks (role checking middleware may be applied globally)
router.use(authenticate);


// Payment statistics
router.get('/payments/stats', async (req, res) => controller.stats(req, res));

// List payments
router.get('/payments', async (req, res) => controller.list(req, res));

// Get payment details
router.get('/payments/:paymentId', async (req, res) => controller.get(req, res));

// Attachment download/stream
router.get('/payments/:paymentId/attachments/:filename', async (req, res) => controller.attachment(req, res));

// Action (approve/reject/need_more_info)
router.patch('/payments/:paymentId', async (req, res) => controller.action(req, res));

// Delete payment
router.delete('/payments/:paymentId', async (req, res) => controller.delete(req, res));

// Add admin note
router.post('/payments/:paymentId/notes', async (req, res) => controller.addNote(req, res));



module.exports = router;
