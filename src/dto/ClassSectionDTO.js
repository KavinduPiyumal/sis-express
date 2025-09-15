class ClassSectionDTO {
  constructor(data) {
    this.id = data.id;
    this.subjectId = data.subjectId;
    this.lecturerId = data.lecturerId;
    this.schedule = data.schedule;
    this.semesterId = data.semesterId;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

module.exports = { ClassSectionDTO };
