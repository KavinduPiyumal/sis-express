class AttendanceDTO {
  constructor(attendance) {
    this.id = attendance.id;
    this.studentId = attendance.studentId;
    this.courseOfferingId = attendance.courseOfferingId;
    this.classSessionId = attendance.classSessionId;
    this.status = attendance.status;
    this.remarks = attendance.remarks ?? null;
    this.markedBy = attendance.markedBy ?? null;
    this.markedAt = attendance.markedAt ?? null;
    this.medicalId = attendance.medicalId ?? null;
    this.createdAt = attendance.createdAt;
    this.updatedAt = attendance.updatedAt;

    // Related objects (optional)
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
    if (data.remarks !== undefined) this.remarks = data.remarks;
    if (data.markedBy !== undefined) this.markedBy = data.markedBy;
    if (data.markedAt !== undefined) this.markedAt = data.markedAt;
    if (data.medicalId !== undefined) this.medicalId = data.medicalId;
  }
}

class AttendanceUpdateDTO {
  constructor(data) {
    if (data.status !== undefined) this.status = data.status;
    if (data.remarks !== undefined) this.remarks = data.remarks;
    if (data.medicalId !== undefined) this.medicalId = data.medicalId;
  }
}

module.exports = {
  AttendanceDTO,
  AttendanceCreateDTO,
  AttendanceUpdateDTO
};
