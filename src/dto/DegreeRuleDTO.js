class DegreeRuleDTO {
  constructor(data) {
    this.id = data.id;
    this.degreeProgramId = data.degreeProgramId;
    this.minCreditsToGraduate = data.minCreditsToGraduate;
    this.minCGPARequired = data.minCGPARequired;
    this.honorsCriteria = data.honorsCriteria;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

module.exports = { DegreeRuleDTO };
