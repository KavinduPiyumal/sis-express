
const Faculty = require('./Faculty');
const DegreeProgram = require('./DegreeProgram');
const Semester = require('./Semester');
const Subject = require('./Subject');
const User = require('./User');
const Student = require('./Student');
const Lecturer = require('./Lecturer');
const Department = require('./Department');
const Batch = require('./Batch');
const CourseOffering = require('./CourseOffering');
const ClassSession = require('./ClassSession');
const Medical = require('./Medical');
const Result = require('./Result');
const Attendance = require('./Attendance');
const Enrollment = require('./Enrollment');

// Associations for new SIS structure
Faculty.hasMany(Department, { foreignKey: 'facultyId', as: 'departments' });
Department.belongsTo(Faculty, { foreignKey: 'facultyId', as: 'faculty' });

Faculty.hasMany(DegreeProgram, { foreignKey: 'facultyId', as: 'programs' });
DegreeProgram.belongsTo(Faculty, { foreignKey: 'facultyId', as: 'faculty' });
DegreeProgram.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });
Department.hasMany(DegreeProgram, { foreignKey: 'departmentId', as: 'programs' });

DegreeProgram.hasMany(Batch, { foreignKey: 'programId', as: 'batches' });
Batch.belongsTo(DegreeProgram, { foreignKey: 'programId', as: 'program' });

Batch.hasMany(Semester, { foreignKey: 'batchId', as: 'semesters' });
Semester.belongsTo(Batch, { foreignKey: 'batchId', as: 'batch' });

Batch.hasMany(Student, { foreignKey: 'batchId', as: 'students' });
Student.belongsTo(Batch, { foreignKey: 'batchId', as: 'batch' });

User.hasOne(Student, { foreignKey: 'userId', as: 'studentProfile' });
Student.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(Lecturer, { foreignKey: 'userId', as: 'lecturerProfile' });
Lecturer.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Department.hasMany(Lecturer, { foreignKey: 'departmentId', as: 'lecturers' });
Lecturer.belongsTo(Department, { foreignKey: 'departmentId', as: 'department' });

Subject.hasMany(CourseOffering, { foreignKey: 'subjectId', as: 'offerings' });
CourseOffering.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });

Semester.hasMany(CourseOffering, { foreignKey: 'semesterId', as: 'offerings' });
CourseOffering.belongsTo(Semester, { foreignKey: 'semesterId', as: 'semester' });

Batch.hasMany(CourseOffering, { foreignKey: 'batchId', as: 'offerings' });
CourseOffering.belongsTo(Batch, { foreignKey: 'batchId', as: 'batch' });

User.hasMany(CourseOffering, { foreignKey: 'lecturerId', as: 'lecturerOfferings' });
CourseOffering.belongsTo(User, { foreignKey: 'lecturerId', as: 'lecturer' });

CourseOffering.hasMany(ClassSession, { foreignKey: 'courseOfferingId', as: 'sessions' });
ClassSession.belongsTo(CourseOffering, { foreignKey: 'courseOfferingId', as: 'courseOffering' });

CourseOffering.hasMany(Enrollment, { foreignKey: 'courseOfferingId', as: 'enrollments' });
Enrollment.belongsTo(CourseOffering, { foreignKey: 'courseOfferingId', as: 'courseOffering' });

Student.hasMany(Enrollment, { foreignKey: 'studentId', as: 'enrollments' });
Enrollment.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

CourseOffering.hasMany(Result, { foreignKey: 'courseOfferingId', as: 'results' });
Result.belongsTo(CourseOffering, { foreignKey: 'courseOfferingId', as: 'courseOffering' });

Student.hasMany(Result, { foreignKey: 'studentId', as: 'results' });
Result.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

CourseOffering.hasMany(Attendance, { foreignKey: 'courseOfferingId', as: 'attendances' });
Attendance.belongsTo(CourseOffering, { foreignKey: 'courseOfferingId', as: 'courseOffering' });

ClassSession.hasMany(Attendance, { foreignKey: 'classSessionId', as: 'attendances' });
Attendance.belongsTo(ClassSession, { foreignKey: 'classSessionId', as: 'classSession' });

Student.hasMany(Attendance, { foreignKey: 'studentId', as: 'attendances' });
Attendance.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

Student.hasMany(Medical, { foreignKey: 'studentId', as: 'medicals' });
Medical.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });

Medical.hasMany(Attendance, { foreignKey: 'medicalId', as: 'excusedAttendances' });
Attendance.belongsTo(Medical, { foreignKey: 'medicalId', as: 'medical' });

const Log = require('./Log');

module.exports = {
  User,
  Student,
  Lecturer,
  Department,
  Batch,
  Faculty,
  DegreeProgram,
  Semester,
  Subject,
  CourseOffering,
  ClassSession,
  Enrollment,
  Attendance,
  Medical,
  Result,
  Log
  // ...other entities as needed
};
