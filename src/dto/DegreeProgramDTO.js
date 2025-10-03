class DegreeProgramDTO {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.duration = data.duration;
    this.facultyId = data.facultyId;
    this.departmentId = data.departmentId;
    this.minCreditsToGraduate = data.minCreditsToGraduate;
    this.minCGPARequired = data.minCGPARequired;
    this.honorsCriteria = data.honorsCriteria;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

module.exports = { DegreeProgramDTO };
