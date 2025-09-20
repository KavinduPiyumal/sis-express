# Complete List of SIS API Endpoints

Below is a comprehensive list of all REST API endpoints in your Student Information System backend, grouped by resource and including method, path, and a brief description.

---

## Authentication
- POST   /api/auth/register                Register a new user
- POST   /api/auth/login                   Login and get JWT
- POST   /api/auth/logout                  Logout user
- GET    /api/auth/me                      Get current user profile
- GET    /api/auth/presigned-url           Get presigned URL for file upload
- GET    /api/auth/presigned-upload-url    Get presigned upload URL
- PUT    /api/auth/profile                 Update user profile
- PUT    /api/auth/profile (with file)     Update profile image
- PUT    /api/auth/change-password         Change password
- POST   /api/auth/send-change-password-otp Send OTP for password change
- POST   /api/auth/verify-token            Verify token (OTP/password reset)
- POST   /api/auth/forgot-password         Request password reset
- POST   /api/auth/reset-password          Reset password

## User
- POST   /api/users                        Create user (admin)
- GET    /api/users                        List all users
- GET    /api/users/stats                  Get user statistics
- GET    /api/users/students               List all students
- GET    /api/users/admins                 List all admins
- GET    /api/users/role/:role             List users by role
- GET    /api/users/:id                    Get user by ID
- PUT    /api/users/:id                    Update user
- DELETE /api/users/:id                    Delete user

## Faculty
- POST   /api/faculties                    Create faculty
- GET    /api/faculties                    List all faculties
- GET    /api/faculties/:id                Get faculty by ID
- PUT    /api/faculties/:id                Update faculty
- DELETE /api/faculties/:id                Delete faculty

## Department
- POST   /api/departments                  Create department
- GET    /api/departments                  List all departments
- GET    /api/departments/:id              Get department by ID
- PUT    /api/departments/:id              Update department
- DELETE /api/departments/:id              Delete department

## Degree Program
- POST   /api/programs                      Create degree program
- GET    /api/programs                      List all programs
- GET    /api/programs/:id                  Get program by ID
- PUT    /api/programs/:id                  Update program
- DELETE /api/programs/:id                  Delete program

## Batch
- POST   /api/batches                      Create batch
- GET    /api/batches                      List all batches
- GET    /api/batches/:id                  Get batch by ID
- PUT    /api/batches/:id                  Update batch
- DELETE /api/batches/:id                  Delete batch

## Semester
- POST   /api/semesters                    Create semester
- GET    /api/semesters                    List all semesters
- GET    /api/semesters/:id                Get semester by ID
- PUT    /api/semesters/:id                Update semester
- DELETE /api/semesters/:id                Delete semester

## Subject
- POST   /api/subjects                     Create subject
- GET    /api/subjects                     List all subjects
- GET    /api/subjects/:id                 Get subject by ID
- PUT    /api/subjects/:id                 Update subject
- DELETE /api/subjects/:id                 Delete subject

## Course Offering
- POST   /api/course-offerings             Create course offering
- GET    /api/course-offerings             List all course offerings
- GET    /api/course-offerings/:id         Get course offering by ID
- PUT    /api/course-offerings/:id         Update course offering
- DELETE /api/course-offerings/:id         Delete course offering

## Class Session
- POST   /api/class-sessions               Create class session
- GET    /api/class-sessions               List all class sessions
- GET    /api/class-sessions/:id           Get class session by ID
- PUT    /api/class-sessions/:id           Update class session
- DELETE /api/class-sessions/:id           Delete class session

## Student
- POST   /api/students                     Create student
- GET    /api/students                     List all students
- GET    /api/students/:id                 Get student by ID
- PUT    /api/students/:id                 Update student
- DELETE /api/students/:id                 Delete student

## Lecturer
- POST   /api/lecturers                    Create lecturer
- GET    /api/lecturers                    List all lecturers
- GET    /api/lecturers/:id                Get lecturer by ID
- PUT    /api/lecturers/:id                Update lecturer
- DELETE /api/lecturers/:id                Delete lecturer

## Enrollment
- POST   /api/enrollments                  Enroll student (admin)
- POST   /api/enrollments/request          Student requests enrollment
- PUT    /api/enrollments/:id/approve      Approve enrollment
- GET    /api/enrollments                  List all enrollments
- GET    /api/enrollments/:id              Get enrollment by ID
- PUT    /api/enrollments/:id              Update enrollment
- DELETE /api/enrollments/:id              Delete enrollment

## Attendance
- POST   /api/attendances                  Record attendance
- POST   /api/attendances/bulk             Bulk record attendance
- PUT    /api/attendances/:id              Update attendance
- GET    /api/attendances                  List all attendance records
- GET    /api/attendances/:studentId       Get attendance for student
- GET    /api/attendances/:studentId/stats Get attendance stats for student

## Medical
- POST   /api/medicals                     Submit medical
- GET    /api/medicals                     List all medicals
- GET    /api/medicals/:id                 Get medical by ID
- PUT    /api/medicals/:id                 Update medical
- DELETE /api/medicals/:id                 Delete medical

## Medical Report
- POST   /api/medical-reports              Submit medical report
- PUT    /api/medical-reports/:id/review   Review medical report
- GET    /api/medical-reports/student/:studentId Get reports for student
- GET    /api/medical-reports              List all reports

## Transcript
- POST   /api/transcripts                  Create transcript
- GET    /api/transcripts                  List all transcripts
- GET    /api/transcripts/:id              Get transcript by ID
- PUT    /api/transcripts/:id              Update transcript
- DELETE /api/transcripts/:id              Delete transcript

## CGPA
- POST   /api/cgpas                        Create CGPA
- GET    /api/cgpas                        List all CGPAs
- GET    /api/cgpas/:id                    Get CGPA by ID
- PUT    /api/cgpas/:id                    Update CGPA
- DELETE /api/cgpas/:id                    Delete CGPA

## Semester GPA
- POST   /api/semester-gpas                Create semester GPA
- GET    /api/semester-gpas                List all semester GPAs
- GET    /api/semester-gpas/:id            Get semester GPA by ID
- PUT    /api/semester-gpas/:id            Update semester GPA
- DELETE /api/semester-gpas/:id            Delete semester GPA

## Grading System
- POST   /api/grading-systems              Create grading system
- GET    /api/grading-systems              List all grading systems
- GET    /api/grading-systems/:id          Get grading system by ID
- PUT    /api/grading-systems/:id          Update grading system
- DELETE /api/grading-systems/:id          Delete grading system

## Degree Rule
- POST   /api/degree-rules                 Create degree rule
- GET    /api/degree-rules                 List all degree rules
- GET    /api/degree-rules/:id             Get degree rule by ID
- PUT    /api/degree-rules/:id             Update degree rule
- DELETE /api/degree-rules/:id             Delete degree rule

---

> All endpoints require JWT authentication unless otherwise noted. Replace `:id` and other path params with actual values.
