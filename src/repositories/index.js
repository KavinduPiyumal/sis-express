
const MedicalReportRepository = require('./MedicalReportRepository');
const UserRepository = require('./UserRepository');
const AttendanceRepository = require('./AttendanceRepository');
const LogRepository = require('./LogRepository');
const FacultyRepository = require('./FacultyRepository');
const DegreeProgramRepository = require('./DegreeProgramRepository');
const SubjectRepository = require('./SubjectRepository');
const ClassSectionRepository = require('./ClassSectionRepository');
const SemesterRepository = require('./SemesterRepository');
const EnrollmentRepository = require('./EnrollmentRepository');
const SemesterGPARepository = require('./SemesterGPARepository');
const CGPARepository = require('./CGPARepository');
const GradingSystemRepository = require('./GradingSystemRepository');
const DegreeRuleRepository = require('./DegreeRuleRepository');
const TranscriptRepository = require('./TranscriptRepository');
const StudentRepository = require('./StudentRepository');
const LecturerRepository = require('./LecturerRepository');

module.exports = {
  UserRepository,
  StudentRepository,
  LecturerRepository,
  AttendanceRepository,
  LogRepository,
  FacultyRepository,
  DegreeProgramRepository,
  SubjectRepository,
  ClassSectionRepository,
  SemesterRepository,
  EnrollmentRepository,
  SemesterGPARepository,
  CGPARepository,
  GradingSystemRepository,
  DegreeRuleRepository,
  TranscriptRepository,
  MedicalReportRepository
};
