class TranscriptDTO {
  constructor(data) {
    this.id = data.id;
    this.studentId = data.studentId;
    this.issueDate = data.issueDate;
    this.finalCGPA = data.finalCGPA;
    this.graduationStatus = data.graduationStatus;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

module.exports = { TranscriptDTO };
