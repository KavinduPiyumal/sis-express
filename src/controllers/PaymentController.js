const path = require('path');
const fs = require('fs');
const { PaymentCreateDTO, PaymentListQueryDTO } = require('../dto/PaymentDTO');
const getUploadMiddleware = require('../infrastructure/upload');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class PaymentController {
  constructor() {}

  // GET /api/students/me/semesters
  async getSemesters(req, res) {
    try {
      // Simple stub: in real app read from Semester/Batch models
      const yearFilter = req.query.year ? Number(req.query.year) : null;
      // Example: return last 3 semesters
      const now = new Date();
      const year = yearFilter || now.getFullYear();

      const semesters = [
        { id: `${year}-1`, label: `Semester 1, ${year}`, startDate: `${year}-01-01`, endDate: `${year}-06-30` },
        { id: `${year}-2`, label: `Semester 2, ${year}`, startDate: `${year}-07-01`, endDate: `${year}-12-31` }
      ];

      return res.status(200).json({ semesters });
    } catch (error) {
      return res.status(500).json({ message: 'Failed to fetch semesters', error: error.message });
    }
  }

  // GET /api/students/me/fees
  async getFees(req, res) {
    try {
      const userId = req.user && req.user.id ? req.user.id : null;
      if (!userId) return res.status(401).json({ message: 'Authentication required' });

      const semester = req.query.semester;
      if (!semester) return res.status(400).json({ errors: { semester: 'semester query param is required' } });

      // Placeholder: compute fees; in real app query DB
      const fees = [
        { id: 1, type: 'Tuition Fee', amount: 2000, paid: 1000, balance: 1000, dueDate: '2025-10-15', status: 'partial' },
        { id: 2, type: 'Library Fee', amount: 200, paid: 200, balance: 0, dueDate: '2025-09-01', status: 'paid' }
      ];

      const totalDue = fees.reduce((s, f) => s + f.balance, 0);
      const totalPaid = fees.reduce((s, f) => s + f.paid, 0);

      return res.status(200).json({
        studentId: userId,
        semester,
        totalDue,
        totalPaid,
        nextDueDate: '2025-10-15',
        fees
      });
    } catch (error) {
      return res.status(500).json({ message: 'Failed to fetch fees', error: error.message });
    }
  }

  // GET /api/students/me/payments
  async listPayments(req, res) {
    try {
      const userId = req.user && req.user.id ? req.user.id : null;
      if (!userId) return res.status(401).json({ message: 'Authentication required' });

      const qdto = new PaymentListQueryDTO(req.query);

      // Build prisma query
  const where = { studentId: userId };
      if (qdto.q) {
        where.OR = [
          { reference: { contains: qdto.q } },
          { transactionId: { contains: qdto.q } }
        ];
      }
      if (qdto.status) where.status = qdto.status;
      if (qdto.semester) where.semester = qdto.semester;
      if (qdto.startDate || qdto.endDate) {
        where.paymentDate = {};
        if (qdto.startDate) where.paymentDate.gte = new Date(qdto.startDate);
        if (qdto.endDate) where.paymentDate.lte = new Date(qdto.endDate);
      }

      const total = await prisma.payment.count({ where });
      const payments = await prisma.payment.findMany({
        where,
        orderBy: { paymentDate: 'desc' },
        skip: (qdto.page - 1) * qdto.perPage,
        take: qdto.perPage
      });

      // Map slipUrl: if using S3 we can generate presigned URL; otherwise provide endpoint
      const mapped = payments.map(p => ({
        id: p.id,
        date: p.paymentDate,
        amount: p.amount,
        method: null,
        reference: p.receiptNumber || null,
        status: p.status,
        slipUrl: p.filePath ? this.getSlipAccessUrl(p) : null,
        feeType: p.paymentType
      }));

      return res.status(200).json({ page: qdto.page, perPage: qdto.perPage, total, payments: mapped });
    } catch (error) {
      return res.status(500).json({ message: 'Failed to list payments', error: error.message });
    }
  }

  getSlipAccessUrl(payment) {
    // If using S3 and payment.slipPath is a key, generate presigned URL
    if (process.env.UPLOAD_DRIVER === 's3') {
      try {
        const AWS = require('aws-sdk');
        const s3 = new AWS.S3({
          accessKeyId: process.env.S3_ACCESS_KEY,
          secretAccessKey: process.env.S3_SECRET_KEY,
          region: process.env.S3_REGION,
        });
  const params = { Bucket: process.env.S3_BUCKET, Key: payment.filePath || payment.slipPath, Expires: 60 * 5 };
  return s3.getSignedUrl('getObject', params);
      } catch (e) {
        return `/api/students/me/payments/${payment.id}/slip`;
      }
    }
    return `/api/students/me/payments/${payment.id}/slip`;
  }

  // GET /api/students/me/payments/:paymentId
  async getPayment(req, res) {
    try {
      const userId = req.user && req.user.id ? req.user.id : null;
      if (!userId) return res.status(401).json({ message: 'Authentication required' });

      const paymentId = req.params.paymentId;
      const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
      if (!payment) return res.status(404).json({ message: 'Not found' });
      if (String(payment.studentId) !== String(userId)) return res.status(403).json({ message: 'Not allowed' });

      const result = {
        id: payment.id,
        date: payment.paymentDate,
        amount: payment.amount,
        method: null,
        reference: payment.receiptNumber || null,
        status: payment.status,
        feeType: payment.paymentType,
        remarks: payment.description || null,
        slipUrl: payment.filePath ? this.getSlipAccessUrl(payment) : null
      };

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to fetch payment', error: error.message });
    }
  }

  // POST /api/students/me/payments  (multipart)
  async createPayment(req, res) {
    try {
      const upload = getUploadMiddleware({ subDir: 'payments' });
      const uploadSingle = upload.single('slipFile');

      // Use multer to handle file
      uploadSingle(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ errors: { slipFile: err.message } });
        }

        const dto = new PaymentCreateDTO(req.body, req.file, req.headers);
        const validation = dto.validate();
        if (!validation.isValid) {
          // delete uploaded file if invalid
          if (req.file && req.file.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
          return res.status(400).json({ errors: validation.errors });
        }

  // Create payment record
  const studentId = req.user && req.user.id ? req.user.id : null;
  if (!studentId) return res.status(401).json({ message: 'Authentication required' });

        // Save slip path: for local storage store relative path; for s3 we expect file.location or key
        let slipPath = null;
        if (process.env.UPLOAD_DRIVER === 's3') {
          slipPath = req.file && (req.file.key || req.file.location || req.file.path);
        } else {
          slipPath = req.file ? path.relative(path.join(__dirname, '../../'), req.file.path).replace(/\\/g, '/') : null;
        }

        // Map DTO -> Prisma Payment fields
        const fileName = req.file ? (req.file.filename || path.basename(req.file.path)) : null;
        const filePath = slipPath; // relative path saved earlier

        const create = await prisma.payment.create({
          data: {
            studentId,
            amount: Number(dto.paymentAmount),
            paymentDate: new Date(dto.paymentDate),
            paymentType: dto.feeType,
            description: dto.remarks || null,
            receiptNumber: dto.referenceNumber || null,
            fileName: fileName,
            filePath: filePath,
            status: 'pending'
          }
        });

        const response = {
          id: create.id,
          studentId: create.studentId,
          date: create.paymentDate,
          amount: create.amount,
          method: dto.paymentMethod || null,
          reference: create.receiptNumber || null,
          status: create.status,
          feeType: create.paymentType,
          remarks: create.description || null,
          slipUrl: create.filePath ? this.getSlipAccessUrl(create) : null
        };

        return res.status(201).json(response);
      });

    } catch (error) {
      return res.status(500).json({ message: 'Failed to create payment', error: error.message });
    }
  }

  // GET /api/students/me/payments/:paymentId/slip
  async getSlip(req, res) {
    try {
      const userId = req.user && req.user.id ? req.user.id : null;
      if (!userId) return res.status(401).json({ message: 'Authentication required' });

      const paymentId = req.params.paymentId;
      const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
      if (!payment) return res.status(404).json({ message: 'Not found' });
      if (String(payment.studentId) !== String(userId)) return res.status(403).json({ message: 'Not allowed' });

  if (!payment.filePath) return res.status(404).json({ message: 'Slip not found' });

      if (process.env.UPLOAD_DRIVER === 's3') {
        // Redirect to presigned
        const AWS = require('aws-sdk');
        const s3 = new AWS.S3({
          accessKeyId: process.env.S3_ACCESS_KEY,
          secretAccessKey: process.env.S3_SECRET_KEY,
          region: process.env.S3_REGION,
        });
        const params = { Bucket: process.env.S3_BUCKET, Key: payment.filePath, Expires: 60 * 5 };
        const url = s3.getSignedUrl('getObject', params);
        return res.redirect(url);
      }

      // Local file: resolve path
      const baseUploadPath = process.env.UPLOAD_PATH || 'uploads';
      const uploadsDir = path.isAbsolute(baseUploadPath) ? baseUploadPath : path.join(__dirname, '../../', baseUploadPath);

      // payment.filePath may be stored in several forms:
      // - absolute path
      // - relative path starting with the base upload dir (e.g. 'uploads/...')
      // - relative path already relative to project root (e.g. '<user>/...')
      // Normalize and resolve to absolute filesystem path.
      let storedPath = payment.filePath || '';
      let resolvedPath;
      if (path.isAbsolute(storedPath)) {
        resolvedPath = storedPath;
      } else {
        // Normalize separators
        const normalizedBase = baseUploadPath.replace(/\\/g, '/').replace(/\/$/, '');
        const normalizedStored = storedPath.replace(/\\/g, '/').replace(/^\//, '');
        // If the stored path already starts with the base folder, strip it to avoid duplication
        if (normalizedStored.startsWith(normalizedBase + '/')) {
          storedPath = normalizedStored.slice(normalizedBase.length + 1);
        } else {
          storedPath = normalizedStored;
        }
        resolvedPath = path.join(uploadsDir, storedPath);
      }

      if (!fs.existsSync(resolvedPath)) return res.status(404).json({ message: 'Slip file missing' });

      const filename = path.basename(resolvedPath);
      const ext = path.extname(filename).toLowerCase();
      const contentTypes = {
        '.pdf': 'application/pdf', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png'
      };
      const ct = contentTypes[ext] || 'application/octet-stream';
      res.setHeader('Content-Type', ct);
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      const stream = fs.createReadStream(resolvedPath);
      stream.pipe(res);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to fetch slip', error: error.message });
    }
  }

  // DELETE /api/students/me/payments/:paymentId
  async deletePayment(req, res) {
    try {
      const userId = req.user && req.user.id ? req.user.id : null;
      if (!userId) return res.status(401).json({ message: 'Authentication required' });

      const paymentId = req.params.paymentId;
      const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
      if (!payment) return res.status(404).json({ message: 'Not found' });
      if (String(payment.studentId) !== String(userId)) return res.status(403).json({ message: 'Not allowed' });

      if (payment.status !== 'pending') return res.status(403).json({ message: 'Only pending payments can be deleted' });

      // Delete slip file if local
      if (payment.filePath && process.env.UPLOAD_DRIVER !== 's3') {
        const baseUploadPath = process.env.UPLOAD_PATH || 'uploads';
        const uploadsDir = path.isAbsolute(baseUploadPath) ? baseUploadPath : path.join(__dirname, '../../', baseUploadPath);
        const filePath = path.join(uploadsDir, payment.filePath);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }

      await prisma.payment.delete({ where: { id: paymentId } });

      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: 'Failed to delete payment', error: error.message });
    }
  }

  // GET /api/students/me/notifications/payments
  async paymentNotifications(req, res) {
    try {
      const userId = req.user && req.user.id ? req.user.id : null;
      if (!userId) return res.status(401).json({ message: 'Authentication required' });

      // Placeholder: fetch notifications from Notification model filtered by payment type
      const notifications = [
        { id: 'n1', type: 'reminder', title: 'Payment Reminder', message: 'Your tuition fee is due', meta: {}, createdAt: new Date() },
        { id: 'n2', type: 'bank_details', title: 'Bank Account Details', message: 'Send payment to NBSL acc 123456', meta: { bank: 'NBSL', account: '123456' }, createdAt: new Date() }
      ];

      return res.status(200).json({ notifications });
    } catch (error) {
      return res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
    }
  }
}

module.exports = PaymentController;
