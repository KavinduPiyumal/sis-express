const BaseRepository = require('./BaseRepository');
const { CGPA } = require('../entities');

class CGPARepository extends BaseRepository {
  constructor() {
    super(CGPA);
  }
}

module.exports = CGPARepository;
