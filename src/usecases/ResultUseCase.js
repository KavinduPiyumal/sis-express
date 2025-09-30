const ResultRepository = require('../repositories/ResultRepository');
const ResultDTO = require('../dto/ResultDTO');

class ResultUseCase {
  constructor() {
    this.resultRepository = new ResultRepository();
  }

  /**
   * Create a new result
   * @param {Object} data - Result data
   */
  async createResult(data) {
    // Check if result already exists for this student and course offering
    const existing = await this.resultRepository.findExisting(data.studentId, data.courseOfferingId);
    if (existing) {
      throw new Error('Result already exists for this student and course offering');
    }

    // Validate that either marks or grade is provided
    if (!data.marks && !data.grade) {
      throw new Error('Either marks or grade must be provided');
    }

    // If marks are provided, calculate grade and grade point automatically
    if (data.marks && !data.grade) {
      const gradeInfo = this.calculateGrade(parseFloat(data.marks));
      data.grade = gradeInfo.grade;
      data.gradePoint = gradeInfo.gradePoint;
    }

    // If only grade is provided, try to determine grade point
    if (data.grade && !data.gradePoint && !data.marks) {
      data.gradePoint = this.getGradePoint(data.grade);
    }

    const result = await this.resultRepository.create(data);
    return new ResultDTO(result);
  }

  /**
   * Get all results with optional filtering
   * @param {Object} filters - Filter criteria
   */
  async getAllResults(filters = {}) {
    const results = await this.resultRepository.findByFilters(filters);
    return results.map(result => new ResultDTO(result));
  }

  /**
   * Get result by ID
   * @param {string} id - Result ID
   */
  async getResultById(id) {
    const result = await this.resultRepository.findById(id);
    if (!result) throw new Error('Result not found');
    return new ResultDTO(result);
  }

  /**
   * Update a result
   * @param {string} id - Result ID
   * @param {Object} data - Updated result data
   */
  async updateResult(id, data) {
    // Validate that either marks or grade is provided
    if (data.marks === null && data.grade === null) {
      throw new Error('Either marks or grade must be provided');
    }

    // If marks are provided, calculate grade and grade point automatically
    if (data.marks && !data.grade) {
      const gradeInfo = this.calculateGrade(parseFloat(data.marks));
      data.grade = gradeInfo.grade;
      data.gradePoint = gradeInfo.gradePoint;
    }

    // If only grade is provided, try to determine grade point
    if (data.grade && !data.gradePoint && !data.marks) {
      data.gradePoint = this.getGradePoint(data.grade);
    }

    const result = await this.resultRepository.update(id, data);
    if (!result) throw new Error('Result not found');
    return new ResultDTO(result);
  }

  /**
   * Delete a result
   * @param {string} id - Result ID
   */
  async deleteResult(id) {
    const deleted = await this.resultRepository.delete(id);
    if (!deleted) throw new Error('Result not found');
    return { message: 'Result deleted successfully' };
  }

  /**
   * Get results by student ID
   * @param {string} studentId - Student ID
   */
  async getResultsByStudentId(studentId) {
    const results = await this.resultRepository.findByStudentId(studentId);
    return results.map(result => new ResultDTO(result));
  }

  /**
   * Get results by course offering ID
   * @param {string} courseOfferingId - Course offering ID
   */
  async getResultsByCourseOfferingId(courseOfferingId) {
    const results = await this.resultRepository.findByCourseOfferingId(courseOfferingId);
    return results.map(result => new ResultDTO(result));
  }

  /**
   * Get results by lecturer ID (through course offerings)
   * @param {string} lecturerId - Lecturer ID
   */
  async getResultsByLecturerId(lecturerId) {
    const results = await this.resultRepository.findByLecturerId(lecturerId);
    return results.map(result => new ResultDTO(result));
  }

  /**
   * Get results for logged-in lecturer
   * @param {string} userId - User ID of lecturer
   */
  async getResultsByLecturer(userId) {
    // Find lecturer by userId
    const LecturerRepository = require('../repositories/LecturerRepository');
    const lecturerRepo = new LecturerRepository();
    const lecturer = await lecturerRepo.findOne({ userId });
    if (!lecturer) throw new Error('Lecturer record not found for this user');

    const results = await this.resultRepository.findByLecturerId(lecturer.id);
    return results.map(result => new ResultDTO(result));
  }

  /**
   * Get results for logged-in student
   * @param {string} userId - User ID of student
   */
  async getResultsByStudent(userId) {
    // Find student by userId
    const StudentRepository = require('../repositories/StudentRepository');
    const studentRepo = new StudentRepository();
    const student = await studentRepo.findOne({ userId });
    if (!student) throw new Error('Student record not found for this user');

    const results = await this.resultRepository.findByStudentId(student.id);
    return results.map(result => new ResultDTO(result));
  }

  /**
   * Get statistics for a course offering
   * @param {string} courseOfferingId - Course offering ID
   */
  async getCourseOfferingStatistics(courseOfferingId) {
    return await this.resultRepository.getStatistics(courseOfferingId);
  }

  /**
   * Bulk create results for a course offering
   * @param {Array} resultsData - Array of result data
   */
  async bulkCreateResults(resultsData) {
    const createdResults = [];
    const errors = [];

    for (const data of resultsData) {
      try {
        let studentId = data.studentId;

        // If studentNo is provided instead of studentId, find the student
        if (data.studentNo && !data.studentId) {
          const StudentRepository = require('../repositories/StudentRepository');
          const studentRepo = new StudentRepository();
          const student = await studentRepo.findOne({ studentNo: data.studentNo });
          
          if (!student) {
            errors.push({
              studentNo: data.studentNo,
              error: `Student not found with student number: ${data.studentNo}`
            });
            continue;
          }
          
          studentId = student.id;
        }

        if (!studentId) {
          errors.push({
            studentNo: data.studentNo || 'Unknown',
            error: 'Either studentId or studentNo must be provided'
          });
          continue;
        }

        // Check if result already exists
        const existing = await this.resultRepository.findExisting(studentId, data.courseOfferingId);
        if (existing) {
          errors.push({
            studentNo: data.studentNo || 'Unknown',
            studentId: studentId,
            error: 'Result already exists for this student and course offering'
          });
          continue;
        }

        // Validate that either marks or grade is provided
        if (!data.marks && !data.grade) {
          errors.push({
            studentNo: data.studentNo || 'Unknown',
            studentId: studentId,
            error: 'Either marks or grade must be provided'
          });
          continue;
        }

        // Prepare result data
        const resultData = {
          studentId: studentId,
          courseOfferingId: data.courseOfferingId,
          marks: data.marks,
          grade: data.grade,
          gradePoint: data.gradePoint,
          enteredBy: data.enteredBy
        };

        // If marks are provided, calculate grade and grade point automatically
        if (data.marks && !data.grade) {
          const gradeInfo = this.calculateGrade(parseFloat(data.marks));
          resultData.grade = gradeInfo.grade;
          resultData.gradePoint = gradeInfo.gradePoint;
        }

        // If only grade is provided, try to determine grade point
        if (data.grade && !data.gradePoint && !data.marks) {
          resultData.gradePoint = this.getGradePoint(data.grade);
        }

        const result = await this.resultRepository.create(resultData);
        createdResults.push(new ResultDTO(result));
      } catch (error) {
        errors.push({
          studentNo: data.studentNo || 'Unknown',
          studentId: data.studentId || 'Unknown',
          error: error.message
        });
      }
    }

    return {
      created: createdResults,
      errors: errors,
      summary: {
        totalAttempted: resultsData.length,
        successfullyCreated: createdResults.length,
        failed: errors.length
      }
    };
  }

  /**
   * Calculate grade and grade point based on marks
   * @param {number} marks - Student's marks
   */
  calculateGrade(marks) {
    // This should ideally use the GradingSystem from database
    // For now, using a basic grading system
    if (marks >= 85) return { grade: 'A+', gradePoint: 4.0 };
    if (marks >= 80) return { grade: 'A', gradePoint: 4.0 };
    if (marks >= 75) return { grade: 'A-', gradePoint: 3.7 };
    if (marks >= 70) return { grade: 'B+', gradePoint: 3.3 };
    if (marks >= 65) return { grade: 'B', gradePoint: 3.0 };
    if (marks >= 60) return { grade: 'B-', gradePoint: 2.7 };
    if (marks >= 55) return { grade: 'C+', gradePoint: 2.3 };
    if (marks >= 50) return { grade: 'C', gradePoint: 2.0 };
    if (marks >= 45) return { grade: 'C-', gradePoint: 1.7 };
    if (marks >= 40) return { grade: 'D', gradePoint: 1.0 };
    return { grade: 'F', gradePoint: 0.0 };
  }

  /**
   * Get grade point based on letter grade
   * @param {string} grade - Letter grade
   */
  getGradePoint(grade) {
    const gradePoints = {
      'A+': 4.0,
      'A': 4.0,
      'A-': 3.7,
      'B+': 3.3,
      'B': 3.0,
      'B-': 2.7,
      'C+': 2.3,
      'C': 2.0,
      'C-': 1.7,
      'D+': 1.3,
      'D': 1.0,
      'F': 0.0
    };
    
    return gradePoints[grade] || 0.0;
  }

  /**
   * Find student by student number
   * @param {string} studentNo - Student number
   */
  async findStudentByStudentNo(studentNo) {
    const StudentRepository = require('../repositories/StudentRepository');
    const studentRepo = new StudentRepository();
    return await studentRepo.findOne({ studentNo });
  }

  /**
   * Calculate GPA for a student based on their results
   * @param {string} studentId - Student ID
   * @param {string} semesterId - Optional semester ID for semester-specific GPA
   */
  async calculateStudentGPA(studentId, semesterId = null) {
    let filters = { studentId };
    
    // If semesterId is provided, filter by semester
    if (semesterId) {
      filters = {
        studentId,
        courseOffering: {
          semesterId: semesterId
        }
      };
    }

    const results = await this.resultRepository.findByFilters(filters);
    
    if (results.length === 0) {
      return {
        studentId,
        semesterId,
        gpa: 0.0,
        totalCredits: 0,
        totalSubjects: 0,
        results: [],
        gradeDistribution: {},
        message: 'No results found for this student'
      };
    }

    let totalGradePoints = 0;
    let totalCredits = 0;
    const gradeDistribution = {};
    const resultDetails = [];

    for (const result of results) {
      const gradePoint = result.gradePoint || 0;
      const credits = result.courseOffering?.subject?.credits || 3; // Default 3 credits if not specified
      const grade = result.grade || 'F';

      // Calculate weighted grade points
      totalGradePoints += gradePoint * credits;
      totalCredits += credits;

      // Count grade distribution
      gradeDistribution[grade] = (gradeDistribution[grade] || 0) + 1;

      // Add result details
      resultDetails.push({
        courseCode: result.courseOffering?.subject?.code,
        courseName: result.courseOffering?.subject?.name,
        credits: credits,
        marks: result.marks,
        grade: grade,
        gradePoint: gradePoint,
        semester: result.courseOffering?.semester?.name,
        year: result.courseOffering?.year
      });
    }

    const gpa = totalCredits > 0 ? (totalGradePoints / totalCredits) : 0;

    return {
      studentId,
      semesterId,
      gpa: Math.round(gpa * 100) / 100, // Round to 2 decimal places
      totalCredits,
      totalSubjects: results.length,
      totalGradePoints,
      results: resultDetails,
      gradeDistribution,
      student: results[0]?.student ? {
        studentNo: results[0].student.studentNo,
        user: results[0].student.user ? {
          firstName: results[0].student.user.firstName,
          lastName: results[0].student.user.lastName,
          email: results[0].student.user.email
        } : null
      } : null,
      calculatedAt: new Date().toISOString()
    };
  }

  /**
   * Get comprehensive academic record for a student including overall and semester-wise GPAs
   * @param {string} studentId - Student ID
   */
  async getStudentAcademicRecord(studentId) {
    const results = await this.resultRepository.findByFilters({ studentId });
    
    if (results.length === 0) {
      return {
        studentId,
        overallGPA: 0.0,
        semesterGPAs: [],
        totalCredits: 0,
        totalSubjects: 0,
        message: 'No academic record found for this student'
      };
    }

    // Calculate overall GPA
    const overallGPA = await this.calculateStudentGPA(studentId);

    // Group results by semester
    const semesterGroups = {};
    results.forEach(result => {
      const semesterId = result.courseOffering?.semesterId;
      const semesterName = result.courseOffering?.semester?.name;
      
      if (semesterId) {
        if (!semesterGroups[semesterId]) {
          semesterGroups[semesterId] = {
            semesterId,
            semesterName,
            results: []
          };
        }
        semesterGroups[semesterId].results.push(result);
      }
    });

    // Calculate GPA for each semester
    const semesterGPAs = [];
    for (const [semesterId, semesterData] of Object.entries(semesterGroups)) {
      const semesterGPA = await this.calculateStudentGPA(studentId, semesterId);
      semesterGPAs.push({
        semesterId,
        semesterName: semesterData.semesterName,
        gpa: semesterGPA.gpa,
        credits: semesterGPA.totalCredits,
        subjects: semesterGPA.totalSubjects,
        gradeDistribution: semesterGPA.gradeDistribution
      });
    }

    // Sort semesters by name or ID
    semesterGPAs.sort((a, b) => a.semesterName.localeCompare(b.semesterName));

    return {
      studentId,
      student: overallGPA.student,
      overallGPA: overallGPA.gpa,
      totalCredits: overallGPA.totalCredits,
      totalSubjects: overallGPA.totalSubjects,
      gradeDistribution: overallGPA.gradeDistribution,
      semesterGPAs,
      calculatedAt: new Date().toISOString()
    };
  }
}

module.exports = ResultUseCase;