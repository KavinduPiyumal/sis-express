class ClassSessionDTO {
  constructor(classSession) {
    this.id = classSession.id;
    this.courseOfferingId = classSession.courseOfferingId;
    this.date = classSession.date;
    this.topic = classSession.topic;
    this.location = classSession.location;
    this.durationMinutes = classSession.durationMinutes;
    this.createdAt = classSession.createdAt;
    this.updatedAt = classSession.updatedAt;
  }
}

module.exports = ClassSessionDTO;
