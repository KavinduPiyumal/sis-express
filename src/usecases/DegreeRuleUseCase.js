const { DegreeRuleRepository } = require('../repositories');
const { DegreeRuleDTO } = require('../dto/DegreeRuleDTO');

class DegreeRuleUseCase {
  constructor() {
    this.degreeRuleRepository = new DegreeRuleRepository();
  }

  async createDegreeRule(data) {
    const rule = await this.degreeRuleRepository.create(data);
    return new DegreeRuleDTO(rule);
  }

  async getAllDegreeRules() {
    const rules = await this.degreeRuleRepository.findAll();
    return rules.map(r => new DegreeRuleDTO(r));
  }

  async getDegreeRuleById(id) {
    const rule = await this.degreeRuleRepository.findById(id);
    if (!rule) throw new Error('Degree rule not found');
    return new DegreeRuleDTO(rule);
  }

  async updateDegreeRule(id, data) {
    await this.degreeRuleRepository.update(data, { id });
    return this.getDegreeRuleById(id);
  }

  async deleteDegreeRule(id) {
    return this.degreeRuleRepository.delete({ id });
  }
}

module.exports = DegreeRuleUseCase;
