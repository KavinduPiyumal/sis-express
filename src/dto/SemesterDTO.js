class SemesterDTO {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.status = data.status;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

module.exports = { SemesterDTO };
