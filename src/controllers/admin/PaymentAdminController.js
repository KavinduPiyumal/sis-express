const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const path = require('path');
const fs = require('fs');
const { AdminPaymentListDTO, AdminPaymentActionDTO, AdminNoteDTO } = require('../../dto/AdminPaymentDTO');
const logger = require('../../config/logger');
const { log } = require('console');

class PaymentAdminController {
  // GET /api/admin/payments/stats
  async stats(req, res) {
    try {
      // Total payments
      const total = await prisma.payment.count();
      // By status
      const [pending, approved, rejected] = await Promise.all([
        prisma.payment.count({ where: { status: 'pending' } }),
        prisma.payment.count({ where: { status: 'approved' } }),
        prisma.payment.count({ where: { status: 'rejected' } })
      ]);
      // Total amount by status
      const [pendingAmount, approvedAmount, rejectedAmount] = await Promise.all([
        prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'pending' } }),
        prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'approved' } }),
        prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'rejected' } })
      ]);
      // By day (last 7 days)
      const today = new Date();
      const last7 = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const start = new Date(d.setHours(0, 0, 0, 0));
        const end = new Date(d.setHours(23, 59, 59, 999));
        const count = await prisma.payment.count({
          where: {
            createdAt: { gte: start, lte: end }
          }
        });
        last7.push({ date: start.toISOString().slice(0, 10), count });
      }
      return res.status(200).json({
        success: true,
        data: {
          total,
          byStatus: { pending, approved, rejected },
          amountByStatus: {
            pending: pendingAmount._sum.amount || 0,
            approved: approvedAmount._sum.amount || 0,
            rejected: rejectedAmount._sum.amount || 0
          },
          last7Days: last7
        }
      });
    } catch (error) {
      console.error('Admin payment stats error', error);
      return res.status(500).json({ success: false, message: 'Failed to get payment stats', error: error.message });
    }
  }
  constructor() {}

  // GET /api/admin/payments
  async list(req, res) {
    try {
      const dto = new AdminPaymentListDTO(req.query);
      const v = dto.validate();
      if (!v.isValid) return res.status(400).json({ success: false, message: 'Validation failed', errors: v.errors });

      const where = {};
      // status filter
      if (dto.status && dto.status !== 'all') where.status = dto.status;
      // semester filter (Payment model may not have semester; attempt to filter by payment metadata if present)
      if (dto.semester) where.semester = dto.semester;
      // search
      const q = dto.q;
      if (q) {
        // join with User/Student via prisma relations
        // We'll search receiptNumber and student's user name or studentNo
      }

      // Build query with pagination
      const total = await prisma.payment.count({ where });
      const payments = await prisma.payment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (dto.page - 1) * dto.perPage,
        take: dto.perPage,
        include: {
          student: { include: { student: true } },
          feeType: true
        }
      });

      // Additional counts
      const [pendingCount, approvedTodayCount, rejectedTodayCount] = await Promise.all([
        prisma.payment.count({ where: { status: 'pending' } }),
        prisma.payment.count({
          where: {
            status: 'approved',
            reviewedAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lt: new Date(new Date().setHours(23, 59, 59, 999))
            }
          }
        }),
        prisma.payment.count({
          where: {
            status: 'rejected',
            reviewedAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lt: new Date(new Date().setHours(23, 59, 59, 999))
            }
          }
        })
      ]);

      const mapped = payments.map(p => ({
        id: p.id,
        studentId: p.studentId,
        studentName: p.student ? `${p.student.firstName || ''} ${p.student.lastName || ''}`.trim() : null,
        studentNo: p.student && p.student.student ? p.student.student.studentNo : null,
        feeType: p.paymentType,
        feeTypeDueDate: p.feeType ? p.feeType.dueDate : null,
        semesterId: p.semester || null,
        amount: p.amount,
        paymentType: p.paymentType,
        method: null,
        receiptNumber: p.receiptNumber || null,
        attachments: p.filePath ? [{ filename: path.basename(p.filePath), url: `/api/admin/payments/${p.id}/attachments/${encodeURIComponent(path.basename(p.filePath))}` }] : [],
        status: p.status,
        submittedAt: p.paymentDate,
        submittedBy: p.studentId,
        approvedAt: p.reviewedAt || null,
        approvedBy: p.reviewedBy || null,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt
      }));

      return res.status(200).json({
        success: true,
        data: {
          payments: mapped,
          page: dto.page,
          perPage: dto.perPage,
          total,
          pendingCount,
          approvedTodayCount,
          rejectedTodayCount
        }
      });
    } catch (error) {
      console.error('Admin list payments error', error);
      return res.status(500).json({ success: false, message: 'Failed to list payments', error: error.message });
    }
  }

  // GET /api/admin/payments/:id
  async get(req, res) {
    try {
      const { paymentId } = req.params;
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: { student: { include: { student: true } }, feeType: true }
      });
      if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

      // Build response
      const resp = {
        id: payment.id,
        studentId: payment.studentId,
        studentName: payment.student ? `${payment.student.firstName || ''} ${payment.student.lastName || ''}`.trim() : null,
        studentNo: payment.student && payment.student.student ? payment.student.student.studentNo : null,
        feeType: payment.feeType ? payment.feeType.name : (payment.paymentType || null),
        feeTypeDueDate: payment.feeType ? payment.feeType.dueDate : null,
        semesterId: payment.semester || null,
        amount: payment.amount,
        paymentType: payment.feeType ? payment.feeType.name : (payment.paymentType || null),
        method: payment.paymentMethod || null,
        receiptNumber: payment.receiptNumber || null,
        attachments: payment.filePath ? [{ filename: path.basename(payment.filePath), url: `http://localhost:3000/api/admin/payments/${payment.id}/attachments/${encodeURIComponent(path.basename(payment.filePath))}` }] : [],
        status: payment.status,
        paymentDate: payment.paymentDate,
        submittedBy: payment.studentId,
        reviewedAt: payment.reviewedAt || null,
        reviewedBy: payment.reviewedBy || null,
        reviewNotes: payment.reviewNotes || null,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt
      };

      return res.status(200).json({ success: true, data: resp });
    } catch (error) {
      console.error('Admin get payment error', error);
      return res.status(500).json({ success: false, message: 'Failed to get payment', error: error.message });
    }
  }

  // GET /api/admin/payments/:id/attachments/:filename
  async attachment(req, res) {
    try {
      const { paymentId, filename } = req.params;
      const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
      if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
      if (!payment.filePath) return res.status(404).json({ success: false, message: 'Attachment not found' });

      // Resolve local path
      let filePath = payment.filePath;
      logger.info(`Streaming attachment from path: ${filePath}`);
      const base = process.env.UPLOAD_PATH || 'uploads';
      if (!path.isAbsolute(filePath)) {
        // remove leading uploads/ if present
        filePath = filePath.replace(/^uploads[\\/]/, '');
        logger.info(`Resolved relative attachment path: ${filePath}`);
        // filePath = path.join(process.cwd(), base, filePath);
        logger.info(`Final resolved attachment path: ${filePath}`);
      }
      if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: 'File missing on disk' });

  res.type(filename); // Set Content-Type based on file extension
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
    } catch (error) {
      console.error('Attachment error', error);
      return res.status(500).json({ success: false, message: 'Failed to stream attachment', error: error.message });
    }
  }

  // PATCH /api/admin/payments/:id
  async action(req, res) {
    try {
      const { paymentId } = req.params;
      const dto = new AdminPaymentActionDTO(req.body);
      const v = dto.validate();
      if (!v.isValid) return res.status(400).json({ success: false, message: 'Validation failed', errors: v.errors });

      const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
      if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

      // Allowed transitions
      const allowedFrom = ['pending', 'need_more_info'];
      if (!allowedFrom.includes(payment.status) && dto.action !== 'need_more_info') {
        return res.status(409).json({ success: false, message: 'Invalid current status for this action', currentStatus: payment.status });
      }

      // optional optimistic check
      if (dto.expectedStatus && dto.expectedStatus !== payment.status) {
        return res.status(409).json({ success: false, message: 'Expected status mismatch', currentStatus: payment.status });
      }

      const updates = {};
      if (dto.action === 'approve') {
        updates.status = 'approved';
        updates.reviewedBy = req.user && req.user.id ? req.user.id : null;
        updates.reviewedAt = new Date();
      } else if (dto.action === 'reject') {
        updates.status = 'rejected';
        updates.reviewedBy = req.user && req.user.id ? req.user.id : null;
        updates.reviewedAt = new Date();
      } else if (dto.action === 'need_more_info') {
        updates.status = 'need_more_info';
      }

      // append notes
      const note = dto.remarks ? `${new Date().toISOString().slice(0, 10)} | ${req.user && req.user.role === 'super_admin' ? 'Super Admin' : 'Admin'}: ${dto.remarks}` : null;
      if (note) {
        updates.reviewNotes = payment.reviewNotes ? `${payment.reviewNotes}\n${note}` : note;
      }

      const updated = await prisma.payment.update({ where: { id: paymentId }, data: updates });

      // Notify student if payment is approved or rejected
      try {
        if (dto.action === 'approve' || dto.action === 'reject') {
          const UserRepository = require('../../repositories/UserRepository');
          const notificationService = require('../../infrastructure/notificationService');
          const userRepo = new UserRepository();
          const studentUser = await userRepo.findById(payment.studentId);
          if (studentUser) {
            let title, message;
            if (dto.action === 'approve') {
              title = 'Payment Approved';
              message = `Your payment of Rs. ${payment.amount} has been approved.`;
            } else {
              title = 'Payment Rejected';
              message = `Your payment of Rs. ${payment.amount} has been rejected.<br>`;
              if (updates.reviewNotes) message += ` Reason: ${updates.reviewNotes}`;
            }
            // Optionally include studentNo or other info in the message
            // if (studentRecord && studentRecord.studentNo) message += ` (Student No: ${studentRecord.studentNo})`;
            await notificationService.notifyUser({
              user: studentUser,
              title,
              message,
              type: 'payment',
              relatedEntityId: payment.id,
              relatedEntityType: 'payment',
              isNotifyEmail: true
            });
          }
        }
      } catch (notifyErr) {
        logger.warn('Failed to send payment status notification', { error: notifyErr.message });
      }

      return res.status(200).json({ success: true, data: updated });
    } catch (error) {
      console.error('Admin payment action error', error);
      return res.status(500).json({ success: false, message: 'Failed to apply action', error: error.message });
    }
  }

  // DELETE /api/admin/payments/:id
  async delete(req, res) {
    try {
      const { paymentId } = req.params;
      const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
      if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
      if (!['pending', 'need_more_info'].includes(payment.status)) {
        return res.status(409).json({ success: false, message: 'Cannot delete payment in current status', currentStatus: payment.status });
      }

      await prisma.payment.delete({ where: { id: paymentId } });
      // NOTE: attachments cleanup should be handled by FileUploadController or background job
      return res.status(204).send();
    } catch (error) {
      console.error('Admin delete payment error', error);
      return res.status(500).json({ success: false, message: 'Failed to delete payment', error: error.message });
    }
  }

  // POST /api/admin/payments/:id/notes
  async addNote(req, res) {
    try {
      const { paymentId } = req.params;
      const dto = new AdminNoteDTO(req.body);
      const v = dto.validate();
      if (!v.isValid) return res.status(400).json({ success: false, message: 'Validation failed', errors: v.errors });

      const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
      if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });

      const note = `${new Date().toISOString()} | ${req.user && req.user.id ? req.user.id : 'admin'}: ${dto.text}`;
      const reviewNotes = payment.reviewNotes ? `${payment.reviewNotes}\n${note}` : note;
      const updated = await prisma.payment.update({ where: { id: paymentId }, data: { reviewNotes } });
      return res.status(201).json({ success: true, data: { id: paymentId, note, reviewNotes } });
    } catch (error) {
      console.error('Add note error', error);
      return res.status(500).json({ success: false, message: 'Failed to add note', error: error.message });
    }
  }
}

module.exports = PaymentAdminController;
