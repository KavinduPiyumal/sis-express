const BaseRepository = require('./BaseRepository');
const { Transcript } = require('../entities');

class TranscriptRepository extends BaseRepository {
  constructor() {
    super(Transcript);
  }
}

module.exports = TranscriptRepository;
