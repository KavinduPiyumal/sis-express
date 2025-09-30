class SubjectDTO {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.creditHours = data.creditHours;
    this.semesterOffered = data.semesterOffered;
    this.degreeProgramId = data.degreeProgramId;
    this.code = data.code;
    this.description = data.description;
    this.credits = data.credits;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

module.exports = { SubjectDTO };
