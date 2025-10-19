class MedicalReportDTO {
  constructor(data) {
    this.id = data.id;
    this.studentId = data.studentId;
    this.classSessionId = data.classSessionId;
    this.reason = data.reason;
    this.description = data.description;
    this.submitDate = data.submitDate;
    this.status = data.status;
    this.reviewedBy = data.reviewedBy;
    this.reviewNotes = data.reviewNotes;
    this.reviewedAt = data.reviewedAt;
    this.attachments = Array.isArray(data.attachments) ? data.attachments : [];
    this.attendances = Array.isArray(data.attendances) ? data.attendances : [];
  }
}

module.exports = { MedicalReportDTO };
