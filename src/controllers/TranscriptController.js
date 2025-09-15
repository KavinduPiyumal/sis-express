const TranscriptUseCase = require('../usecases/TranscriptUseCase');

class TranscriptController {
  constructor() {
    this.useCase = new TranscriptUseCase();
  }

  create = async (req, res, next) => {
    try {
      const transcript = await this.useCase.createTranscript(req.body);
      res.status(201).json({ success: true, data: transcript });
    } catch (err) { next(err); }
  };

  getAll = async (req, res, next) => {
    try {
      const transcripts = await this.useCase.getAllTranscripts();
      res.json({ success: true, data: transcripts });
    } catch (err) { next(err); }
  };

  getById = async (req, res, next) => {
    try {
      const transcript = await this.useCase.getTranscriptById(req.params.id);
      res.json({ success: true, data: transcript });
    } catch (err) { next(err); }
  };

  update = async (req, res, next) => {
    try {
      const transcript = await this.useCase.updateTranscript(req.params.id, req.body);
      res.json({ success: true, data: transcript });
    } catch (err) { next(err); }
  };

  delete = async (req, res, next) => {
    try {
      await this.useCase.deleteTranscript(req.params.id);
      res.json({ success: true, message: 'Deleted' });
    } catch (err) { next(err); }
  };
}

module.exports = new TranscriptController();
