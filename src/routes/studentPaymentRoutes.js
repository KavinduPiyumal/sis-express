const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/PaymentController');
const authenticate = require('../middlewares/auth');
const { requireRole } = require('../middlewares/authorize') || {}; // optional

const controller = new PaymentController();

// All routes require authentication
router.use(authenticate);

// GET semesters
router.get('/semesters', async (req, res) => controller.getSemesters(req, res));

// GET fees for a semester
router.get('/fees', async (req, res) => controller.getFees(req, res));

// List payments
router.get('/payments', async (req, res) => controller.listPayments(req, res));

// Get single payment
router.get('/payments/:paymentId', async (req, res) => controller.getPayment(req, res));

// Download/stream slip
router.get('/payments/:paymentId/slip', async (req, res) => controller.getSlip(req, res));

// Create payment (multipart)
router.post('/payments', async (req, res) => controller.createPayment(req, res));

// Delete payment
router.delete('/payments/:paymentId', async (req, res) => controller.deletePayment(req, res));

// Payment related notifications
router.get('/notifications/payments', async (req, res) => controller.paymentNotifications(req, res));

module.exports = router;
