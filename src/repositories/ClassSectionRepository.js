const BaseRepository = require('./BaseRepository');
const { ClassSection } = require('../entities');

class ClassSectionRepository extends BaseRepository {
  constructor() {
    super(ClassSection);
  }
}

module.exports = ClassSectionRepository;
