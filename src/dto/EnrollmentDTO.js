class EnrollmentDTO {
  constructor(data) {
    this.id = data.id;
    this.studentId = data.studentId;
    this.classSectionId = data.classSectionId;
    this.enrollmentDate = data.enrollmentDate;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

module.exports = { EnrollmentDTO };
