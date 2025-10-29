const path = require('path');
const fs = require('fs');
const { PaymentCreateDTO, PaymentListQueryDTO, allowedFeeTypes } = require('../dto/PaymentDTO');
const getUploadMiddleware = require('../infrastructure/upload');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class PaymentController {
  constructor() {}

  // GET /api/students/me/semesters
  async getSemesters(req, res) {
    try {
      const userId = req.user && req.user.id ? req.user.id : null;
      if (!userId) return res.status(401).json({ message: 'Authentication required' });

      // Find the student record for this user
      const student = await prisma.student.findUnique({
        where: { userId },
        include: { batch: true }
      });
      if (!student) return res.status(404).json({ message: 'Student not found' });

      // Fetch all semesters for the student's batch
      const semesters = await prisma.semester.findMany({
        where: { batchId: student.batchId },
        orderBy: { startDate: 'asc' }
      });

      // Optionally, map to a simpler format if needed
      const mapped = semesters.map(s => ({
        id: s.id,
        name: s.name,
        startDate: s.startDate,
        endDate: s.endDate,
        status: s.status
      }));

      return res.status(200).json({ semesters: mapped });
    } catch (error) {
      return res.status(500).json({ message: 'Failed to fetch semesters', error: error.message });
    }
  }

  // GET /api/students/me/fees
  async getFees(req, res) {
    try {
      const userId = req.user && req.user.id ? req.user.id : null;
      if (!userId) return res.status(401).json({ message: 'Authentication required' });


      // Fetch student with batch
      const student = await prisma.student.findUnique({
        where: { userId },
        include: { batch: true }
      });
      if (!student) return res.status(404).json({ message: 'Student not found' });

      // Determine semesterId: use query param if present, else find inprogress semester for student's batch
      let semesterId = null;
      let semester = null;
      if (semesterId) {
        semester = await prisma.semester.findUnique({
          where: { id: semesterId },
          include: { batch: true }
        });
        if (!semester) return res.status(404).json({ message: 'Semester not found' });
      } else {
        semester = await prisma.semester.findFirst({
          where: { batchId: student.batchId, status: 'inprogress' },
          orderBy: { startDate: 'desc' },
          include: { batch: true }
        });
        if (!semester) return res.status(404).json({ message: 'No in-progress semester found for your batch' });
        semesterId = semester.id;
      }

      // Fetch all relevant fee types
      const feeTypes = await prisma.feeType.findMany({
        where: {
          OR: [
            { type: 'general', isActive: true },
            { type: 'batchwise', batchId: student.batchId, isActive: true },
            { type: 'semesterwise', semesterId: semesterId, isActive: true }
          ]
        },
        include: {
          batch: true,
          semester: { include: { batch: true } }
        }
      });


      // Fetch all payments for this student and these feeTypes
      const feeTypeIds = feeTypes.map(f => f.id);
      const payments = await prisma.payment.findMany({
        where: {
          studentId: userId,
          feeTypeId: { in: feeTypeIds },
          status: { in: ['pending', 'approved'] }
        }
      });

      // Group payments by feeTypeId
      const paymentsByFeeType = {};
      for (const p of payments) {
        if (!paymentsByFeeType[p.feeTypeId]) paymentsByFeeType[p.feeTypeId] = [];
        paymentsByFeeType[p.feeTypeId].push(p);
      }

      // Categorize fees by type, with paid/balance/status
      const categorizedFees = {
        general: [],
        batchwise: [],
        semesterwise: []
      };
      for (const f of feeTypes) {
        const relatedPayments = paymentsByFeeType[f.id] || [];
        const amount = Number(f.defaultAmount) || 0;
        // Sum both approved and pending payments for paid calculation
        const paid = relatedPayments
          .filter(p => p.status === 'approved' || p.status === 'pending')
          .reduce((sum, p) => sum + Number(p.amount), 0);
        // Sum only approved payments
        const approvedPaid = relatedPayments
          .filter(p => p.status === 'approved')
          .reduce((sum, p) => sum + Number(p.amount), 0);
        const balance = Math.max(amount - paid, 0);
        let status = 'pending';
        if (paid >= amount && amount > 0) {
          // If approved payments also cover amount, mark as verified
          if (approvedPaid >= amount) status = 'verified';
          else status = 'paid';
        } else if (paid > 0 && paid < amount) {
          status = 'partial';
        }

        const feeObj = {
          id: f.id,
          name: f.name,
          code: f.code,
          amount: f.defaultAmount,
          description: f.description,
          isActive: f.isActive,
          type: f.type,
          batchId: f.batchId,
          semesterId: f.semesterId,
          dueDate: f.dueDate,
          createdBy: f.createdBy,
          createdAt: f.createdAt,
          updatedAt: f.updatedAt,
          batch: f.batchId && f.batch ? { id: f.batch.id, name: f.batch.name } : null,
          semester: f.semesterId && f.semester ? {
            id: f.semester.id,
            name: f.semester.name,
            batch: f.semester.batch ? { id: f.semester.batch.id, name: f.semester.batch.name } : null
          } : null,
          paid,
          balance,
          status
        };
        if (f.type === 'general') categorizedFees.general.push(feeObj);
        else if (f.type === 'batchwise') categorizedFees.batchwise.push(feeObj);
        else if (f.type === 'semesterwise') categorizedFees.semesterwise.push(feeObj);
      }

      return res.status(200).json({
        studentId: userId,
        batch: student.batch ? { id: student.batch.id, name: student.batch.name } : null,
        semester: { id: semester.id, name: semester.name, batch: semester.batch ? { id: semester.batch.id, name: semester.batch.name } : null },
        fees: categorizedFees
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
      // Parse and validate status query parameter (accept CSV or repeated params)
      const statusRaw = req.query.status;
      let statuses = [];
      if (statusRaw) {
        if (Array.isArray(statusRaw)) {
          statuses = statusRaw.flatMap(s => String(s).split(',').map(x => x.trim()).filter(Boolean));
        } else {
          statuses = String(statusRaw).split(',').map(x => x.trim()).filter(Boolean);
        }
      }
      const ALLOWED_STATUSES = ['pending', 'approved', 'rejected'];
      if (statuses.length) {
        const invalid = statuses.filter(s => !ALLOWED_STATUSES.includes(s));
        if (invalid.length) {
          return res.status(400).json({ success: false, message: `Invalid status value(s): ${invalid.join(',')}. Allowed: ${ALLOWED_STATUSES.join(',')}` });
        }
        where.status = { in: statuses };
      }

      if (qdto.q) {
        // Use actual Payment model fields for text search
        where.OR = [
          { receiptNumber: { contains: qdto.q } },
          { description: { contains: qdto.q } },
          { fileName: { contains: qdto.q } }
        ];
      }
      if (qdto.status) where.status = qdto.status;
      // Note: Payment model does not have a 'semester' field; ignore semester filter here
      if (qdto.startDate || qdto.endDate) {
        where.paymentDate = {};
        if (qdto.startDate) where.paymentDate.gte = new Date(qdto.startDate);
        if (qdto.endDate) where.paymentDate.lte = new Date(qdto.endDate);
      }

      // Fetch payments with related feeType for richer response
      const total = await prisma.payment.count({ where });
      const payments = await prisma.payment.findMany({
        where,
        orderBy: { paymentDate: 'desc' },
        skip: (qdto.page - 1) * qdto.perPage,
        take: qdto.perPage,
        include: { feeType: true }
      });

      // Map slipUrl: if using S3 we can generate presigned URL; otherwise provide endpoint
      const mapped = payments.map(p => ({
        id: p.id,
        date: p.paymentDate,
        amount: p.amount,
        // Try to get method from paymentMethod, or fallback to description or null
        method: p.paymentMethod || p.method || null,
        reference: p.receiptNumber || null,
        status: p.status,
        slipUrl: p.filePath ? this.getSlipAccessUrl(p) : null,
        // Only set feeType as the name string (if available)
        feeType: p.feeType ? p.feeType.name : (p.paymentType || null)
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
        const prisma = require('../infrastructure/prisma');
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


    // Get current userId
    const userId = req.user && req.user.id ? req.user.id : null;
    if (!userId) return res.status(401).json({ message: 'Authentication required' });

  // Find the student record for this user (for notification only)
  const studentRecord = await prisma.student.findUnique({ where: { userId } });
  if (!studentRecord) return res.status(404).json({ message: 'Student record not found' });
  // For Payment.studentId, use userId (User model)
  const studentId = userId;

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

        // Determine paymentType (enum) only if matches allowed enums, otherwise leave null and use feeTypeId
        let paymentTypeValue = null;
        if (dto.feeType && allowedFeeTypes.includes(dto.feeType)) paymentTypeValue = dto.feeType;


        const feeTypeIdValue = dto.feeTypeId || null;
        // Validate feeTypeId is set and valid
        if (!feeTypeIdValue) {
          return res.status(400).json({ errors: { feeTypeId: 'feeTypeId is required' } });
        }
        const feeType = await prisma.feeType.findUnique({ where: { id: feeTypeIdValue } });
        if (!feeType) {
          return res.status(400).json({ errors: { feeTypeId: 'Invalid feeTypeId' } });
        }

        const create = await prisma.payment.create({
          data: {
            studentId, // This is userId
            amount: Number(dto.paymentAmount),
            paymentDate: new Date(dto.paymentDate),
            paymentType: paymentTypeValue,
            feeTypeId: feeTypeIdValue,
            description: dto.remarks || null,
            receiptNumber: dto.referenceNumber || null,
            fileName: fileName,
            filePath: filePath,
            status: 'pending',
            paymentMethod: dto.paymentMethod || null
          },
          include: { feeType: true }
        });

        // Notify student (payment received and pending review)
        try {
          const notificationService = require('../infrastructure/notificationService');
          const UserRepository = require('../repositories/UserRepository');
          const userRepo = new UserRepository();
          // Use studentRecord.userId to get the user
          let studentUser = null;
          if (studentRecord && studentRecord.userId) {
            studentUser = await userRepo.findById(studentRecord.userId);
            if (studentUser) {
              await notificationService.notifyUser({
                user: studentUser,
                title: 'Payment Received',
                message: `Your payment of Rs. ${create.amount} for fee "${create.feeType ? create.feeType.name : (create.paymentType || '')}" has been received and is pending review.`,
                type: 'payment',
                relatedEntityId: create.id,
                relatedEntityType: 'payment',
                isNotifyEmail: true
              });
            }
          }

          // Notify all super_admins (payment pending review)
          const superAdmins = await userRepo.findByRole('super_admin');
          for (const admin of superAdmins) {
            await notificationService.notifyUser({
              user: admin,
              title: 'New Payment Pending Review',
              message: `A new payment of Rs. ${create.amount} from student ${studentUser ? (studentUser.firstName + ' ' + studentUser.lastName) : studentRecord.userId} is pending review.`,
              type: 'payment',
              relatedEntityId: create.id,
              relatedEntityType: 'payment',
              isNotifyEmail: true
            });
          }
        } catch (notifyErr) {
          // Log but do not block response
          const logger = require('../config/logger');
          logger.warn('Failed to send payment notifications', { error: notifyErr.message });
        }

        const response = {
          id: create.id,
          studentId: create.studentId,
          date: create.paymentDate,
          amount: create.amount,
          method: dto.paymentMethod || null,
          reference: create.receiptNumber || null,
          status: create.status,
          // Prefer returning the linked FeeType if present, otherwise return the enum paymentType (legacy)
          feeTypeId: create.feeTypeId || null,
          feeType: create.feeType ? { id: create.feeType.id, name: create.feeType.name, code: create.feeType.code, defaultAmount: create.feeType.defaultAmount } : (create.paymentType || null),
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
      const notifications = [];
      // // Fetch student and batch
      // const student = await prisma.student.findUnique({
      //   where: { userId },
      //   include: { batch: true }
      // });
      // if (!student) return res.status(404).json({ message: 'Student not found' });

      // // Find all relevant fee types for this student
      // const feeTypes = await prisma.feeType.findMany({
      //   where: {
      //     OR: [
      //       { type: 'general', isActive: true },
      //       { type: 'batchwise', batchId: student.batchId, isActive: true },
      //       { type: 'semesterwise', semesterId: { not: null }, isActive: true }
      //     ]
      //   }
      // });
      // const feeTypeIds = feeTypes.map(f => f.id);

      // // Fetch all payments for this student and these feeTypes
      // const payments = await prisma.payment.findMany({
      //   where: {
      //     studentId: userId,
      //     feeTypeId: { in: feeTypeIds },
      //     status: { in: ['pending', 'approved'] }
      //   }
      // });
      // // Group payments by feeTypeId
      // const paymentsByFeeType = {};
      // for (const p of payments) {
      //   if (!paymentsByFeeType[p.feeTypeId]) paymentsByFeeType[p.feeTypeId] = [];
      //   paymentsByFeeType[p.feeTypeId].push(p);
      // }

      // // Generate notifications based on due dates and payment status
      // 
      // const now = new Date();
      // for (const f of feeTypes) {
      //   const relatedPayments = paymentsByFeeType[f.id] || [];
      //   const amount = Number(f.defaultAmount) || 0;
      //   const paid = relatedPayments
      //     .filter(p => p.status === 'approved' || p.status === 'pending')
      //     .reduce((sum, p) => sum + Number(p.amount), 0);
      //   const approvedPaid = relatedPayments
      //     .filter(p => p.status === 'approved')
      //     .reduce((sum, p) => sum + Number(p.amount), 0);
      //   let status = 'pending';
      //   if (paid >= amount && amount > 0) {
      //     if (approvedPaid >= amount) status = 'verified';
      //     else status = 'paid';
      //   } else if (paid > 0 && paid < amount) {
      //     status = 'partial';
      //   }

      //   // Only notify if not fully verified
      //   if (status !== 'verified') {
      //     // If due date is set and in the future or near, add reminder
      //     if (f.dueDate) {
      //       const dueDate = new Date(f.dueDate);
      //       const daysLeft = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
      //       let urgency = '';
      //       if (daysLeft < 0) urgency = 'overdue';
      //       else if (daysLeft === 0) urgency = 'due today';
      //       else if (daysLeft <= 7) urgency = 'due soon';
      //       else urgency = '';
      //       notifications.push({
      //         id: `fee_${f.id}`,
      //         type: 'reminder',
      //         title: `Fee Due: ${f.name}`,
      //         message: `Your fee "${f.name}" of amount ${f.defaultAmount} is ${urgency ? urgency : 'due'}${f.dueDate ? ` on ${dueDate.toLocaleDateString()}` : ''}.`,
      //         meta: {
      //           feeType: f.name,
      //           dueDate: f.dueDate,
      //           date: f.dueDate ? new Date(f.dueDate).toLocaleDateString() : null,
      //           status,
      //           amount: f.defaultAmount
      //         },
      //         // createdAt: now
      //       });
      //     }
      //   }
      // }

      // Add bank details notification from env
      const bankName = process.env.BANK_NAME || 'NBSL';
      const bankBranch = process.env.BANK_BRANCH || 'Main Branch';
      const bankAccount = process.env.BANK_ACCOUNT || '123456';
      const bankDetailsMsg = process.env.BANK_DETAILS_MESSAGE || `Send payment to ${bankName} acc ${bankAccount}`;
      notifications.push({
        id: 'bank_details',
        type: 'bank_details',
        title: 'Bank Account Details',
        message: bankDetailsMsg,
        meta: { bank: bankName, branch: bankBranch, account: bankAccount },
        // createdAt: now
      });

      return res.status(200).json({ notifications });
    } catch (error) {
      return res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
    }
  }
}

module.exports = PaymentController;
