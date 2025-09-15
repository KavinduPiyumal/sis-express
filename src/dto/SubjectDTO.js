class SubjectDTO {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.creditHours = data.creditHours;
    this.semesterOffered = data.semesterOffered;
    this.degreeProgramId = data.degreeProgramId;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

module.exports = { SubjectDTO };
