class ResultDTO {
  constructor(result) {
    this.id = result.id;
    this.studentId = result.studentId;
    this.courseOfferingId = result.courseOfferingId;
    this.marks = result.marks;
    this.grade = result.grade;
    this.gradePoint = result.gradePoint;
    this.enteredBy = result.enteredBy;
    this.enteredAt = result.enteredAt;
    
    // Include student details if available
    if (result.student) {
      this.student = {
        id: result.student.id,
        studentNo: result.student.studentNo,
        status: result.student.status
      };
      
      if (result.student.user) {
        this.student.user = {
          id: result.student.user.id,
          firstName: result.student.user.firstName,
          lastName: result.student.user.lastName,
          email: result.student.user.email
        };
      }
      
      if (result.student.batch) {
        this.student.batch = {
          id: result.student.batch.id,
          name: result.student.batch.name,
          startYear: result.student.batch.startYear
        };
        
        if (result.student.batch.program) {
          this.student.batch.program = {
            id: result.student.batch.program.id,
            name: result.student.batch.program.name,
            duration: result.student.batch.program.duration
          };
          
          if (result.student.batch.program.faculty) {
            this.student.batch.program.faculty = {
              id: result.student.batch.program.faculty.id,
              name: result.student.batch.program.faculty.name,
              deanName: result.student.batch.program.faculty.deanName
            };
          }
          
          if (result.student.batch.program.department) {
            this.student.batch.program.department = {
              id: result.student.batch.program.department.id,
              name: result.student.batch.program.department.name
            };
          }
        }
      }
    }
    
    // Include course offering details if available
    if (result.courseOffering) {
      this.courseOffering = {
        id: result.courseOffering.id,
        year: result.courseOffering.year,
        mode: result.courseOffering.mode,
        capacity: result.courseOffering.capacity
      };
      
      if (result.courseOffering.subject) {
        this.courseOffering.subject = {
          id: result.courseOffering.subject.id,
          code: result.courseOffering.subject.code,
          name: result.courseOffering.subject.name,
          credits: result.courseOffering.subject.credits,
          description: result.courseOffering.subject.description
        };
      }
      
      if (result.courseOffering.semester) {
        this.courseOffering.semester = {
          id: result.courseOffering.semester.id,
          name: result.courseOffering.semester.name,
          startDate: result.courseOffering.semester.startDate,
          endDate: result.courseOffering.semester.endDate,
          status: result.courseOffering.semester.status
        };
      }
      
      if (result.courseOffering.batch) {
        this.courseOffering.batch = {
          id: result.courseOffering.batch.id,
          name: result.courseOffering.batch.name,
          startYear: result.courseOffering.batch.startYear
        };
      }
      
      if (result.courseOffering.lecturer) {
        this.courseOffering.lecturer = {
          id: result.courseOffering.lecturer.id,
          lecturerId: result.courseOffering.lecturer.lecturerId,
          status: result.courseOffering.lecturer.status
        };
        
        if (result.courseOffering.lecturer.user) {
          this.courseOffering.lecturer.user = {
            id: result.courseOffering.lecturer.user.id,
            firstName: result.courseOffering.lecturer.user.firstName,
            lastName: result.courseOffering.lecturer.user.lastName,
            email: result.courseOffering.lecturer.user.email
          };
        }
      }
    }
    
    // Include entered by user details if available
    if (result.enteredByUser) {
      this.enteredByUser = {
        id: result.enteredByUser.id,
        firstName: result.enteredByUser.firstName,
        lastName: result.enteredByUser.lastName,
        email: result.enteredByUser.email
      };
    }
    
    // Add computed fields for better handling of marks vs grades
    this.hasMarks = result.marks !== null && result.marks !== undefined;
    this.hasGrade = result.grade !== null && result.grade !== undefined && result.grade !== '';
    this.hasGradePoint = result.gradePoint !== null && result.gradePoint !== undefined;
    
    // Determine result type
    this.resultType = this.hasMarks ? 'marks' : (this.hasGrade ? 'grade' : 'incomplete');
    
    // Calculate status based on available data
    if (this.hasMarks) {
      this.status = parseFloat(result.marks) >= 40 ? 'pass' : 'fail'; // Assuming 40 is pass mark
    } else if (this.hasGrade) {
      // Define passing grades
      const passingGrades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D'];
      this.status = passingGrades.includes(result.grade) ? 'pass' : 'fail';
    } else {
      this.status = 'incomplete';
    }
    
    // Add display text for better UI handling
    this.displayResult = this.hasMarks ? `${result.marks}` : 
                        this.hasGrade ? result.grade : 
                        'Not graded';
  }
}

module.exports = ResultDTO;