const BaseRepository = require('./BaseRepository');
const { MedicalReport } = require('../entities');

class MedicalReportRepository extends BaseRepository {
  constructor() {
    super(MedicalReport);
  }
}

module.exports = MedicalReportRepository;
