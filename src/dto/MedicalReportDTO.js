class MedicalReportDTO {
  constructor(data) {
    this.id = data.id;
    this.studentId = data.studentId;
    this.title = data.title;
    this.description = data.description;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.fileName = data.fileName;
    this.filePath = data.filePath;
    this.status = data.status;
    this.reviewedBy = data.reviewedBy;
    this.reviewNotes = data.reviewNotes;
    this.reviewedAt = data.reviewedAt;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

module.exports = { MedicalReportDTO };
