class GradingSystemDTO {
  constructor(data) {
    this.id = data.id;
    this.gradeLetter = data.gradeLetter;
    this.minMarks = data.minMarks;
    this.maxMarks = data.maxMarks;
    this.gradePoint = data.gradePoint;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

module.exports = { GradingSystemDTO };
