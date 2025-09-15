const { TranscriptRepository } = require('../repositories');
const { TranscriptDTO } = require('../dto/TranscriptDTO');

class TranscriptUseCase {
  constructor() {
    this.transcriptRepository = new TranscriptRepository();
  }

  async createTranscript(data) {
    const transcript = await this.transcriptRepository.create(data);
    return new TranscriptDTO(transcript);
  }

  async getAllTranscripts() {
    const transcripts = await this.transcriptRepository.findAll();
    return transcripts.map(t => new TranscriptDTO(t));
  }

  async getTranscriptById(id) {
    const transcript = await this.transcriptRepository.findById(id);
    if (!transcript) throw new Error('Transcript not found');
    return new TranscriptDTO(transcript);
  }

  async updateTranscript(id, data) {
    await this.transcriptRepository.update(data, { id });
    return this.getTranscriptById(id);
  }

  async deleteTranscript(id) {
    return this.transcriptRepository.delete({ id });
  }
}

module.exports = TranscriptUseCase;
