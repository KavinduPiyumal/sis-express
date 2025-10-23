class MedicalReportDTO {
  constructor(data) {
    this.id = data.id;
    this.reason = data.reason;
    this.description = data.description;
    this.submitDate = data.submitDate;
    this.status = data.status;
    this.reviewedBy = data.reviewedBy;
    this.reviewNotes = data.reviewNotes;
    this.reviewedAt = data.reviewedAt;
    this.attachments = Array.isArray(data.attachments) ? data.attachments : [];
    this.attendances = Array.isArray(data.attendances) ? data.attendances : [];

    // Student details
    if (data.student) {
      this.student = {
        id: data.student.id,
        studentNo: data.student.studentNo,
        status: data.student.status,
        user: data.student.user ? {
          id: data.student.user.id,
          firstName: data.student.user.firstName,
          lastName: data.student.user.lastName,
          email: data.student.user.email
        } : null
      };
    }

    // Class session details
    if (data.classSession) {
      this.classSession = {
        id: data.classSession.id,
        date: data.classSession.date,
        topic: data.classSession.topic,
        courseOffering: data.classSession.courseOffering ? {
          id: data.classSession.courseOffering.id,
          year: data.classSession.courseOffering.year,
          subject: data.classSession.courseOffering.subject ? {
            id: data.classSession.courseOffering.subject.id,
            name: data.classSession.courseOffering.subject.name
          } : null
        } : null
      };
    }
  }
}

module.exports = { MedicalReportDTO };
