class DegreeProgramDTO {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.duration = data.duration;
    this.facultyId = data.facultyId;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

module.exports = { DegreeProgramDTO };
