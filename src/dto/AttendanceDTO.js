class AttendanceDTO {
  constructor(attendance) {
    this.id = attendance.id;
    this.studentId = attendance.studentId;
    this.date = attendance.date;
    this.status = attendance.status;
    this.subject = attendance.subject;
    this.notes = attendance.notes;
    this.recordedBy = attendance.recordedBy;
    this.createdAt = attendance.createdAt;
    this.updatedAt = attendance.updatedAt;
    
    // Include related data if available
    if (attendance.student) {
      this.student = {
        id: attendance.student.id,
        firstName: attendance.student.firstName,
        lastName: attendance.student.lastName,
        studentId: attendance.student.studentId
      };
    }
    
    if (attendance.recorder) {
      this.recorder = {
        id: attendance.recorder.id,
        firstName: attendance.recorder.firstName,
        lastName: attendance.recorder.lastName
      };
    }
  }
}

class AttendanceCreateDTO {
  constructor(data) {
    this.studentId = data.studentId;
    this.date = data.date;
    this.status = data.status;
    this.subject = data.subject;
    this.notes = data.notes;
    this.recordedBy = data.recordedBy;
  }
}

class AttendanceUpdateDTO {
  constructor(data) {
    this.status = data.status;
    this.subject = data.subject;
    this.notes = data.notes;
  }
}

module.exports = {
  AttendanceDTO,
  AttendanceCreateDTO,
  AttendanceUpdateDTO
};
