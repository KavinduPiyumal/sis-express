const User = require('./User');
const Attendance = require('./Attendance');
const MedicalReport = require('./MedicalReport');
const Notice = require('./Notice');
const Payment = require('./Payment');
const Result = require('./Result');
const Log = require('./Log');
const Link = require('./Link');
const Notification = require('./Notification');
const Faculty = require('./Faculty');
const DegreeProgram = require('./DegreeProgram');
const Subject = require('./Subject');
const ClassSection = require('./ClassSection');
const Semester = require('./Semester');
const Enrollment = require('./Enrollment');
const SemesterGPA = require('./SemesterGPA');
const CGPA = require('./CGPA');
const GradingSystem = require('./GradingSystem');
const DegreeRule = require('./DegreeRule');
const Transcript = require('./Transcript');


// Existing associations
User.hasMany(Attendance, { foreignKey: 'studentId', as: 'attendances' });
Attendance.belongsTo(User, { foreignKey: 'studentId', as: 'student' });
Attendance.belongsTo(User, { foreignKey: 'recordedBy', as: 'recorder' });

User.hasMany(MedicalReport, { foreignKey: 'studentId', as: 'medicalReports' });
MedicalReport.belongsTo(User, { foreignKey: 'studentId', as: 'student' });
MedicalReport.belongsTo(User, { foreignKey: 'reviewedBy', as: 'reviewer' });

User.hasMany(Payment, { foreignKey: 'studentId', as: 'payments' });
Payment.belongsTo(User, { foreignKey: 'studentId', as: 'student' });
Payment.belongsTo(User, { foreignKey: 'reviewedBy', as: 'reviewer' });

User.hasMany(Result, { foreignKey: 'studentId', as: 'results' });
Result.belongsTo(User, { foreignKey: 'studentId', as: 'student' });
Result.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });

User.hasMany(Notice, { foreignKey: 'createdBy', as: 'notices' });
Notice.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

User.hasMany(Link, { foreignKey: 'createdBy', as: 'links' });
Link.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

User.hasMany(Log, { foreignKey: 'userId', as: 'logs' });
Log.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });


Faculty.hasMany(DegreeProgram, { foreignKey: 'facultyId', as: 'degreePrograms' });
DegreeProgram.belongsTo(Faculty, { foreignKey: 'facultyId', as: 'faculty' });

DegreeProgram.hasMany(Subject, { foreignKey: 'degreeProgramId', as: 'subjects' });
Subject.belongsTo(DegreeProgram, { foreignKey: 'degreeProgramId', as: 'degreeProgram' });

Subject.hasMany(ClassSection, { foreignKey: 'subjectId', as: 'classSections' });
ClassSection.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });

Faculty.hasMany(User, { foreignKey: 'facultyId', as: 'lecturers' }); // Lecturer is a User
User.belongsTo(Faculty, { foreignKey: 'facultyId', as: 'faculty' });

DegreeProgram.hasMany(User, { foreignKey: 'degreeProgramId', as: 'students' }); // Student is a User
User.belongsTo(DegreeProgram, { foreignKey: 'degreeProgramId', as: 'degreeProgram' });

ClassSection.hasMany(Enrollment, { foreignKey: 'classSectionId', as: 'enrollments' });
Enrollment.belongsTo(ClassSection, { foreignKey: 'classSectionId', as: 'classSection' });
User.hasMany(Enrollment, { foreignKey: 'studentId', as: 'enrollments' });
Enrollment.belongsTo(User, { foreignKey: 'studentId', as: 'student' });

Semester.hasMany(ClassSection, { foreignKey: 'semesterId', as: 'classSections' });
ClassSection.belongsTo(Semester, { foreignKey: 'semesterId', as: 'semester' });

User.hasMany(SemesterGPA, { foreignKey: 'studentId', as: 'semesterGPAs' });
SemesterGPA.belongsTo(User, { foreignKey: 'studentId', as: 'student' });
Semester.hasMany(SemesterGPA, { foreignKey: 'semesterId', as: 'semesterGPAs' });
SemesterGPA.belongsTo(Semester, { foreignKey: 'semesterId', as: 'semester' });

User.hasOne(CGPA, { foreignKey: 'studentId', as: 'cgpa' });
CGPA.belongsTo(User, { foreignKey: 'studentId', as: 'student' });


DegreeProgram.hasOne(DegreeRule, { foreignKey: 'degreeProgramId', as: 'degreeRule' });
DegreeRule.belongsTo(DegreeProgram, { foreignKey: 'degreeProgramId', as: 'degreeProgram' });

User.hasOne(Transcript, { foreignKey: 'studentId', as: 'transcript' });
Transcript.belongsTo(User, { foreignKey: 'studentId', as: 'student' });

module.exports = {
  User,
  Attendance,
  MedicalReport,
  Notice,
  Payment,
  Result,
  Log,
  Link,
  Notification,
  Faculty,
  DegreeProgram,
  Subject,
  ClassSection,
  Semester,
  Enrollment,
  SemesterGPA,
  CGPA,
  GradingSystem,
  DegreeRule,
  Transcript
};
