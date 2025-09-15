const BaseRepository = require('./BaseRepository');
const { Subject } = require('../entities');

class SubjectRepository extends BaseRepository {
  constructor() {
    super(Subject);
  }
}

module.exports = SubjectRepository;
