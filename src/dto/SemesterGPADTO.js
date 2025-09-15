class SemesterGPADTO {
  constructor(data) {
    this.id = data.id;
    this.studentId = data.studentId;
    this.semesterId = data.semesterId;
    this.gpaValue = data.gpaValue;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

module.exports = { SemesterGPADTO };
