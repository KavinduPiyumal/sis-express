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
    
    // Include related records if available
    if (offering.subject) {
      this.subject = {
        id: offering.subject.id,
        code: offering.subject.code,
        name: offering.subject.name,
        credits: offering.subject.credits,
        description: offering.subject.description
      };
    }
    
    if (offering.semester) {
      this.semester = {
        id: offering.semester.id,
        name: offering.semester.name,
        startDate: offering.semester.startDate,
        endDate: offering.semester.endDate,
        status: offering.semester.status
      };
    }
    
    if (offering.batch) {
      this.batch = {
        id: offering.batch.id,
        name: offering.batch.name,
        startYear: offering.batch.startYear
      };
      
      if (offering.batch.program) {
        this.batch.program = {
          id: offering.batch.program.id,
          name: offering.batch.program.name,
          duration: offering.batch.program.duration
        };
        
        if (offering.batch.program.faculty) {
          this.batch.program.faculty = {
            id: offering.batch.program.faculty.id,
            name: offering.batch.program.faculty.name,
            deanName: offering.batch.program.faculty.deanName
          };
        }
        
        if (offering.batch.program.department) {
          this.batch.program.department = {
            id: offering.batch.program.department.id,
            name: offering.batch.program.department.name
          };
        }
      }
    }
    
    if (offering.lecturer) {
      this.lecturer = {
        id: offering.lecturer.id,
        lecturerId: offering.lecturer.lecturerId,
        status: offering.lecturer.status
      };
      
      if (offering.lecturer.user) {
        this.lecturer.user = {
          id: offering.lecturer.user.id,
          firstName: offering.lecturer.user.firstName,
          lastName: offering.lecturer.user.lastName,
          email: offering.lecturer.user.email
        };
      }
      
      if (offering.lecturer.department) {
        this.lecturer.department = {
          id: offering.lecturer.department.id,
          name: offering.lecturer.department.name
        };
      }
    }
    
    // Include enrollment records if available
    if (offering.enrollments) {
      this.enrollments = offering.enrollments.map(enrollment => ({
        id: enrollment.id,
        status: enrollment.status,
        enrolledDate: enrollment.enrolledDate,
        student: enrollment.student ? {
          id: enrollment.student.id,
          studentNo: enrollment.student.studentNo,
          status: enrollment.student.status,
          user: enrollment.student.user ? {
            id: enrollment.student.user.id,
            firstName: enrollment.student.user.firstName,
            lastName: enrollment.student.user.lastName,
            email: enrollment.student.user.email
          } : null
        } : null
      }));
    }
  }
}

module.exports = CourseOfferingDTO;
