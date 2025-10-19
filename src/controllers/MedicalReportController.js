const MedicalReportUseCase = require('../usecases/MedicalReportUseCase');

class MedicalReportController {
  // Get medical report summary stats for the authenticated student
  getStudentSummaryStats = async (req, res, next) => {
    try {
      if (!req.user.student || !req.user.student.id) {
        return res.status(403).json({ success: false, message: 'No student record for user' });
      }
      const studentId = req.user.student.id;
      const reports = await this.useCase.medicalReportRepository.findAll({ studentId });
      const total = reports.length;
      const approved = reports.filter(r => r.status === 'approved').length;
      const pending = reports.filter(r => r.status === 'pending').length;
      const rejected = reports.filter(r => r.status === 'rejected').length;

      // Basic analysis
      let analysis = '';
      if (total === 0) {
        analysis = 'No medical reports submitted.';
      } else if (approved / total > 0.7) {
        analysis = 'Most medical reports are approved.';
      } else if (rejected / total > 0.5) {
        analysis = 'High rejection rate. Please review submission quality.';
      } else if (pending > 0) {
        analysis = 'There are pending requests awaiting review.';
      } else {
        analysis = 'Submission stats are within normal range.';
      }

      res.json({
        success: true,
        summary: {
          totalSubmissions: total,
          approved,
          pending,
          rejected,
          analysis
        }
      });
    } catch (err) { next(err); }
  };
  // Admin: Get all medical reports for course offerings assigned to admin (with all relations)
  getByAdminCourseOfferings = async (req, res, next) => {
    try {
      const adminId = req.user.id;
      const reports = await this.useCase.getMedicalReportsForAdminCourseOfferings(adminId);
      res.json({ success: true, data: reports });
    } catch (err) { next(err); }
  };
  updateByStudent = async (req, res, next) => {
    try {
      const report = await this.useCase.medicalReportRepository.findById(req.params.id);
      if (!report) return res.status(404).json({ error: 'Medical report not found' });
      // Use student id from req.user.student (set by auth middleware)
      if (!req.user.student || !req.user.student.id) {
        return res.status(403).json({ error: 'Forbidden: No student record for user' });
      }
      if (report.studentId !== req.user.student.id) return res.status(403).json({ error: 'Forbidden' });
      if (report.status !== 'pending') return res.status(400).json({ error: 'Cannot update after review' });
      // Only allow update of reason, description, and attachments
      const { reason, description, attachments } = req.body;
      console.log('MedicalReportController.updateByStudent received attachments:', attachments);
      await this.useCase.medicalReportRepository.update(req.params.id, { reason, description });
      // Optionally update attachments (delete old, add new)
      if (Array.isArray(attachments)) {
        const prisma = require('../infrastructure/prisma');
        await prisma.medicalReportAttachment.deleteMany({ where: { medicalReportId: report.id } });
        for (const att of attachments) {
          await prisma.medicalReportAttachment.create({ data: { ...att, medicalReportId: report.id } });
        }
      }
      const updated = await this.useCase.medicalReportRepository.findById(report.id);
      res.json({
        success: true,
        message: 'Medical report updated successfully',
        data: updated
      });
    } catch (err) { next(err); }
  };

  deleteByStudent = async (req, res, next) => {
    try {
      const report = await this.useCase.medicalReportRepository.findById(req.params.id);
      if (!report) return res.status(404).json({ error: 'Medical report not found' });
      // Use student id from req.user.student (set by auth middleware)
      if (!req.user.student || !req.user.student.id) {
        return res.status(403).json({ error: 'Forbidden: No student record for user' });
      }
      if (report.studentId !== req.user.student.id) return res.status(403).json({ error: 'Forbidden' });
      if (report.status !== 'pending') return res.status(400).json({ error: 'Cannot delete after review' });
      await this.useCase.medicalReportRepository.delete(report.id);
      res.json({
        success: true,
        message: 'Medical report deleted successfully',
        id: report.id
      });
    } catch (err) { next(err); }
  };
  constructor() {
    this.useCase = new MedicalReportUseCase();
  }

  submit = async (req, res, next) => {
    try {
      let studentId;
      if (req.user.role === 'student') {
        if (!req.user.student || !req.user.student.id) {
          return res.status(404).json({ success: false, message: 'Student record not found for user' });
        }
        studentId = req.user.student.id;
      } else if (!studentId) {
        return res.status(400).json({ success: false, message: 'studentId is required' });
      }
      const report = await this.useCase.submitMedicalReport(req.body, studentId);
      res.status(201).json({ success: true, data: report });
    } catch (err) { next(err); }
  };

  review = async (req, res, next) => {
    try {
      const { status, reviewNotes } = req.body;
      const report = await this.useCase.reviewMedicalReport(
        req.params.id,
        req.user.id,
        req.user.role,
        status,
        reviewNotes
      );
      res.json({ success: true, data: report });
    } catch (err) { next(err); }
  };

  getByStudent = async (req, res, next) => {
    try {
      const { studentId } = req.params;
      const { classSessionId } = req.query;
      const reports = await this.useCase.getMedicalReportsByStudent(studentId, classSessionId);
      res.json({ success: true, data: reports });
    } catch (err) { next(err); }
  };

  getAll = async (req, res, next) => {
    try {
      const reports = await this.useCase.getAllMedicalReports();
      res.json({ success: true, data: reports });
    } catch (err) { next(err); }
  };


    // Delete a medical report attachment by id (fileId)
  deleteAttachment = async (req, res, next) => {
    try {
      const { fileId } = req.params;
      const prisma = require('../infrastructure/prisma');
      // Find the attachment
      const attachment = await prisma.medicalReportAttachment.findUnique({ where: { id: fileId } });
      if (!attachment) {
        return res.status(404).json({ success: false, message: 'Attachment not found' });
      }
      // Delete the file from disk if local storage
      if (process.env.UPLOAD_DRIVER !== 's3' && attachment.filePath) {
        const fs = require('fs');
        let fileDeleted = false;
        // 1. Try to delete using the filePath in the record
        try {
          if (fs.existsSync(attachment.filePath)) {
            fs.unlinkSync(attachment.filePath);
            fileDeleted = true;
          }
        } catch (err) {
          // Log error but continue to fallback
          console.error('Error deleting file with record filePath:', err);
        }
        // 2. If not deleted, try fallback with UPLOAD_PATH
        if (!fileDeleted) {
          try {
            const path = require('path');
            const currentBase = process.env.UPLOAD_PATH || path.join(__dirname, '../../uploads');
            let relativePath;
            const lowerFilePath = attachment.filePath.toLowerCase();
            const uploadsIdx = lowerFilePath.indexOf('uploads');
            if (uploadsIdx !== -1) {
              // Get everything after 'uploads' (including subfolders and filename)
              relativePath = attachment.filePath.substring(uploadsIdx + 'uploads'.length + 1);
              const fallbackPath = path.join(currentBase, relativePath);
              if (fs.existsSync(fallbackPath)) {
                fs.unlinkSync(fallbackPath);
                fileDeleted = true;
              }
            }
          } catch (err) {
            console.error('Error deleting file with fallback path:', err);
          }
        }
      }
      // Delete the record from DB
      await prisma.medicalReportAttachment.delete({ where: { id: fileId } });
      res.json({ success: true, message: 'Attachment deleted successfully' });
    } catch (err) { next(err); }
  };
}

module.exports = new MedicalReportController();
