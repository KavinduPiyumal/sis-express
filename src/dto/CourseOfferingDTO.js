class CourseOfferingDTO {
  constructor(offering) {
    this.id = offering.id;
    this.subjectId = offering.subjectId;
    this.semesterId = offering.semesterId;
    this.batchId = offering.batchId;
    this.lecturerId = offering.lecturerId;
    this.year = offering.year;
    this.mode = offering.mode;
    this.capacity = offering.capacity;
    this.createdAt = offering.createdAt;
    this.updatedAt = offering.updatedAt;
  }
}

module.exports = CourseOfferingDTO;
