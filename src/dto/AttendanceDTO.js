class AttendanceDTO {
  constructor(attendance) {
    this.id = attendance.id;
    this.studentId = attendance.studentId;
    this.courseOfferingId = attendance.courseOfferingId;
    this.classSessionId = attendance.classSessionId;
    this.status = attendance.status;
    this.remarks = attendance.remarks;
    this.markedBy = attendance.markedBy;
    this.markedAt = attendance.markedAt;
    this.medicalId = attendance.medicalId;
    this.createdAt = attendance.createdAt;
    this.updatedAt = attendance.updatedAt;

    // Related objects
    if (attendance.student) {
      this.student = attendance.student;
    }
    if (attendance.courseOffering) {
      this.courseOffering = attendance.courseOffering;
    }
    if (attendance.classSession) {
      this.classSession = attendance.classSession;
    }
    if (attendance.medical) {
      this.medical = attendance.medical;
    }
  }
}

class AttendanceCreateDTO {
  constructor(data) {
    this.studentId = data.studentId;
    this.courseOfferingId = data.courseOfferingId;
    this.classSessionId = data.classSessionId;
    this.status = data.status;
    this.remarks = data.remarks;
    this.markedBy = data.markedBy;
    this.markedAt = data.markedAt;
    this.medicalId = data.medicalId;
  }
}

class AttendanceUpdateDTO {
  constructor(data) {
    this.status = data.status;
    this.remarks = data.remarks;
    this.medicalId = data.medicalId;
  }
}

module.exports = {
  AttendanceDTO,
  AttendanceCreateDTO,
  AttendanceUpdateDTO
};
