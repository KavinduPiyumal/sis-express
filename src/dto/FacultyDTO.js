class FacultyDTO {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.deanName = data.deanName;
    this.contactInfo = data.contactInfo;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

module.exports = { FacultyDTO };
