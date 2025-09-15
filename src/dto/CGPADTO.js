class CGPADTO {
  constructor(data) {
    this.id = data.id;
    this.studentId = data.studentId;
    this.cgpaValue = data.cgpaValue;
    this.graduationStatus = data.graduationStatus;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

module.exports = { CGPADTO };
