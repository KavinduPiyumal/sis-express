const BaseRepository = require('./BaseRepository');
const Student = require('../entities/Student');

class StudentRepository extends BaseRepository {
  constructor() {
    super(Student);
  }
}

module.exports = StudentRepository;
