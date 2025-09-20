class EnrollmentDTO {
  constructor(data) {
    this.id = data.id;
    this.studentId = data.studentId;
    this.courseOfferingId = data.courseOfferingId;
    this.status = data.status;
    this.enrolledDate = data.enrolledDate;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

module.exports = { EnrollmentDTO };
