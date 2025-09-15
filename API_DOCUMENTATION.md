---
# Student Information System (SIS) API Documentation

> This document lists all available API endpoints, their request/response details, and cURL examples for each. All endpoints (except register/login/health) require JWT authentication via `Authorization: Bearer <token>`.

---

## Authentication APIs

### Register
**POST** `/api/auth/register`
- **Body:** `{ firstName, lastName, email, password, role, studentId? }`
- **Response:** `201 Created` with user info and token
```bash
curl -X POST http://localhost:3000/api/auth/register \
	-H "Content-Type: application/json" \
	-d '{"firstName":"John","lastName":"Doe","email":"john@example.com","password":"secret123","role":"student"}'
```

### Login
**POST** `/api/auth/login`
- **Body:** `{ email, password }`
- **Response:** `200 OK` with user info and token
```bash
curl -X POST http://localhost:3000/api/auth/login \
	-H "Content-Type: application/json" \
	-d '{"email":"john@example.com","password":"secret123"}'
```

### Logout
**POST** `/api/auth/logout` *(JWT required)*
- **Response:** `200 OK` (success message)
```bash
curl -X POST http://localhost:3000/api/auth/logout -H "Authorization: Bearer <token>"
```

### Get Profile
**GET** `/api/auth/me` *(JWT required)*
- **Response:** `200 OK` with user profile
```bash
curl http://localhost:3000/api/auth/me -H "Authorization: Bearer <token>"
```

### Update Profile
**PUT** `/api/auth/profile` *(JWT required)*
- **Body:** Profile fields (optionally with `profileImage` file)
- **Response:** `200 OK` with updated user
```bash
curl -X PUT http://localhost:3000/api/auth/profile \
	-H "Authorization: Bearer <token>" \
	-F "firstName=Jane" -F "profileImage=@/path/to/image.jpg"
```

### Change Password
**PUT** `/api/auth/change-password` *(JWT required)*
- **Body:** `{ currentPassword, newPassword }`
- **Response:** `200 OK` (success message)
```bash
curl -X PUT http://localhost:3000/api/auth/change-password \
	-H "Authorization: Bearer <token>" \
	-H "Content-Type: application/json" \
	-d '{"currentPassword":"oldpass","newPassword":"newpass123"}'
```

### Forgot Password
**POST** `/api/auth/forgot-password`
- **Body:** `{ email }`
- **Response:** `200 OK` (OTP sent)
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
	-H "Content-Type: application/json" \
	-d '{"email":"john@example.com"}'
```

### Reset Password
**POST** `/api/auth/reset-password`
- **Body:** `{ token, newPassword }`
- **Response:** `200 OK` (success message)
```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
	-H "Content-Type: application/json" \
	-d '{"token":"OTP_OR_TOKEN","newPassword":"newpass123"}'
```

---

## User Management APIs

### Create User
**POST** `/api/users/` *(Super Admin only)*
- **Body:** `{ firstName, lastName, email, role, studentId?, password? }`
- **Response:** `201 Created` with user info
```bash
curl -X POST http://localhost:3000/api/users/ \
	-H "Authorization: Bearer <token>" \
	-H "Content-Type: application/json" \
	-d '{"firstName":"Jane","lastName":"Smith","email":"jane@example.com","role":"admin"}'
```

### Get All Users
**GET** `/api/users/` *(Super Admin only)*
- **Response:** `200 OK` with user list
```bash
curl http://localhost:3000/api/users/ -H "Authorization: Bearer <token>"
```

### Get User By ID
**GET** `/api/users/:id` *(Owner/Admin/Super Admin)*
- **Response:** `200 OK` with user info
```bash
curl http://localhost:3000/api/users/<userId> -H "Authorization: Bearer <token>"
```

### Update User
**PUT** `/api/users/:id` *(Owner/Admin/Super Admin)*
- **Body:** Any updatable user fields
- **Response:** `200 OK` with updated user
```bash
curl -X PUT http://localhost:3000/api/users/<userId> \
	-H "Authorization: Bearer <token>" \
	-H "Content-Type: application/json" \
	-d '{"firstName":"Janet"}'
```

### Delete User
**DELETE** `/api/users/:id` *(Super Admin only)*
- **Response:** `200 OK` (success message)
```bash
curl -X DELETE http://localhost:3000/api/users/<userId> -H "Authorization: Bearer <token>"
```

### Get Students/Admins/Stats/By Role
**GET** `/api/users/students` *(Admin/Super Admin)*
**GET** `/api/users/admins` *(Super Admin)*
**GET** `/api/users/stats` *(Super Admin)*
**GET** `/api/users/role/:role` *(Admin/Super Admin)*
```bash
curl http://localhost:3000/api/users/students -H "Authorization: Bearer <token>"
curl http://localhost:3000/api/users/admins -H "Authorization: Bearer <token>"
curl http://localhost:3000/api/users/stats -H "Authorization: Bearer <token>"
curl http://localhost:3000/api/users/role/student -H "Authorization: Bearer <token>"
```

---

## Attendance APIs

### Create Attendance
**POST** `/api/attendance/` *(Admin/Super Admin)*
- **Body:** `{ studentId, date, status, subject?, notes? }`
- **Response:** `201 Created` with attendance record
```bash
curl -X POST http://localhost:3000/api/attendance/ \
	-H "Authorization: Bearer <token>" \
	-H "Content-Type: application/json" \
	-d '{"studentId":"<uuid>","date":"2025-09-15","status":"present"}'
```

### Bulk Create Attendance
**POST** `/api/attendance/bulk` *(Admin/Super Admin)*
- **Body:** `{ attendanceRecords: [{ studentId, date, status }] }`
- **Response:** `201 Created` with records
```bash
curl -X POST http://localhost:3000/api/attendance/bulk \
	-H "Authorization: Bearer <token>" \
	-H "Content-Type: application/json" \
	-d '{"attendanceRecords":[{"studentId":"<uuid>","date":"2025-09-15","status":"present"}]}'
```

### Update Attendance
**PUT** `/api/attendance/:id` *(Admin/Super Admin)*
- **Body:** `{ status?, subject?, notes? }`
- **Response:** `200 OK` with updated record
```bash
curl -X PUT http://localhost:3000/api/attendance/<attendanceId> \
	-H "Authorization: Bearer <token>" \
	-H "Content-Type: application/json" \
	-d '{"status":"absent"}'
```

### Get All Attendance
**GET** `/api/attendance/` *(Admin/Super Admin)*
- **Response:** `200 OK` with attendance list
```bash
curl http://localhost:3000/api/attendance/ -H "Authorization: Bearer <token>"
```

### Get Attendance By Student
**GET** `/api/attendance/:studentId` *(Student/Admin/Super Admin)*
- **Response:** `200 OK` with records
```bash
curl http://localhost:3000/api/attendance/<studentId> -H "Authorization: Bearer <token>"
```

### Get Attendance Stats
**GET** `/api/attendance/:studentId/stats` *(Student/Admin/Super Admin)*
- **Response:** `200 OK` with stats
```bash
curl http://localhost:3000/api/attendance/<studentId>/stats -H "Authorization: Bearer <token>"
```

---

## Faculty APIs

**All endpoints require JWT. Only Super Admin can create/update/delete.**

### Create Faculty
**POST** `/api/faculties/`
```bash
curl -X POST http://localhost:3000/api/faculties/ -H "Authorization: Bearer <token>" -d '{"name":"Science"}'
```
### Get All Faculties
**GET** `/api/faculties/`
```bash
curl http://localhost:3000/api/faculties/ -H "Authorization: Bearer <token>"
```
### Get Faculty By ID
**GET** `/api/faculties/:id`
```bash
curl http://localhost:3000/api/faculties/<facultyId> -H "Authorization: Bearer <token>"
```
### Update Faculty
**PUT** `/api/faculties/:id`
```bash
curl -X PUT http://localhost:3000/api/faculties/<facultyId> -H "Authorization: Bearer <token>" -d '{"name":"New Name"}'
```
### Delete Faculty
**DELETE** `/api/faculties/:id`
```bash
curl -X DELETE http://localhost:3000/api/faculties/<facultyId> -H "Authorization: Bearer <token>"
```

---

## Subject APIs

**All endpoints require JWT. Only Admin/Super Admin can create/update.**

### Create Subject
**POST** `/api/subjects/`
```bash
curl -X POST http://localhost:3000/api/subjects/ -H "Authorization: Bearer <token>" -d '{"name":"Math"}'
```
### Get All Subjects
**GET** `/api/subjects/`
```bash
curl http://localhost:3000/api/subjects/ -H "Authorization: Bearer <token>"
```
### Get Subject By ID
**GET** `/api/subjects/:id`
```bash
curl http://localhost:3000/api/subjects/<subjectId> -H "Authorization: Bearer <token>"
```
### Update Subject
**PUT** `/api/subjects/:id`
```bash
curl -X PUT http://localhost:3000/api/subjects/<subjectId> -H "Authorization: Bearer <token>" -d '{"name":"New Name"}'
```
### Delete Subject
**DELETE** `/api/subjects/:id`
```bash
curl -X DELETE http://localhost:3000/api/subjects/<subjectId> -H "Authorization: Bearer <token>"
```

---

## Semester APIs

**All endpoints require JWT.**

### Create Semester
**POST** `/api/semesters/`
```bash
curl -X POST http://localhost:3000/api/semesters/ -H "Authorization: Bearer <token>" -d '{"name":"Semester 1"}'
```
### Get All Semesters
**GET** `/api/semesters/`
```bash
curl http://localhost:3000/api/semesters/ -H "Authorization: Bearer <token>"
```
### Get Semester By ID
**GET** `/api/semesters/:id`
```bash
curl http://localhost:3000/api/semesters/<semesterId> -H "Authorization: Bearer <token>"
```
### Update Semester
**PUT** `/api/semesters/:id`
```bash
curl -X PUT http://localhost:3000/api/semesters/<semesterId> -H "Authorization: Bearer <token>" -d '{"name":"New Name"}'
```
### Delete Semester
**DELETE** `/api/semesters/:id`
```bash
curl -X DELETE http://localhost:3000/api/semesters/<semesterId> -H "Authorization: Bearer <token>"
```

---

## Enrollment APIs

### Student Request Enrollment
**POST** `/api/enrollments/request` *(Student only)*
```bash
curl -X POST http://localhost:3000/api/enrollments/request -H "Authorization: Bearer <token>" -d '{"degreeProgramId":"<id>"}'
```
### Admin Approve Enrollment
**PUT** `/api/enrollments/:id/approve` *(Admin/Super Admin)*
```bash
curl -X PUT http://localhost:3000/api/enrollments/<enrollmentId>/approve -H "Authorization: Bearer <token>"
```
### Admin Create Enrollment
**POST** `/api/enrollments/` *(Admin/Super Admin)*
```bash
curl -X POST http://localhost:3000/api/enrollments/ -H "Authorization: Bearer <token>" -d '{"studentId":"<id>","degreeProgramId":"<id>"}'
```
### Get All Enrollments
**GET** `/api/enrollments/`
```bash
curl http://localhost:3000/api/enrollments/ -H "Authorization: Bearer <token>"
```
### Get Enrollment By ID
**GET** `/api/enrollments/:id`
```bash
curl http://localhost:3000/api/enrollments/<enrollmentId> -H "Authorization: Bearer <token>"
```
### Update Enrollment
**PUT** `/api/enrollments/:id` *(Admin/Super Admin)*
```bash
curl -X PUT http://localhost:3000/api/enrollments/<enrollmentId> -H "Authorization: Bearer <token>" -d '{"status":"approved"}'
```
### Delete Enrollment
**DELETE** `/api/enrollments/:id` *(Admin/Super Admin)*
```bash
curl -X DELETE http://localhost:3000/api/enrollments/<enrollmentId> -H "Authorization: Bearer <token>"
```

---

## Medical Report APIs

### Submit Medical Report
**POST** `/api/medical-reports/` *(Student only)*
```bash
curl -X POST http://localhost:3000/api/medical-reports/ -H "Authorization: Bearer <token>" -F "file=@/path/to/report.pdf"
```
### Review Medical Report
**PUT** `/api/medical-reports/:id/review` *(Admin/Super Admin)*
```bash
curl -X PUT http://localhost:3000/api/medical-reports/<reportId>/review -H "Authorization: Bearer <token>" -d '{"status":"approved"}'
```
### Get Reports By Student
**GET** `/api/medical-reports/student/:studentId`
```bash
curl http://localhost:3000/api/medical-reports/student/<studentId> -H "Authorization: Bearer <token>"
```
### Get All Reports
**GET** `/api/medical-reports/` *(Admin/Super Admin)*
```bash
curl http://localhost:3000/api/medical-reports/ -H "Authorization: Bearer <token>"
```

---

## Other APIs (CGPA, Semester GPA, Class Section, Degree Program, Degree Rule, Grading System, Transcript)

**All endpoints require JWT.**

Replace `<resource>` with one of: `cgpas`, `semester-gpas`, `class-sections`, `degree-programs`, `degree-rules`, `grading-systems`, `transcripts`

### Create
**POST** `/api/<resource>/`
```bash
curl -X POST http://localhost:3000/api/<resource>/ -H "Authorization: Bearer <token>" -d '{...}'
```
### Get All
**GET** `/api/<resource>/`
```bash
curl http://localhost:3000/api/<resource>/ -H "Authorization: Bearer <token>"
```
### Get By ID
**GET** `/api/<resource>/:id`
```bash
curl http://localhost:3000/api/<resource>/<id> -H "Authorization: Bearer <token>"
```
### Update
**PUT** `/api/<resource>/:id`
```bash
curl -X PUT http://localhost:3000/api/<resource>/<id> -H "Authorization: Bearer <token>" -d '{...}'
```
### Delete
**DELETE** `/api/<resource>/:id`
```bash
curl -X DELETE http://localhost:3000/api/<resource>/<id> -H "Authorization: Bearer <token>"
```

---

## Notes
- Replace `<token>` with your JWT.
- Replace `<id>`, `<userId>`, `<studentId>`, etc. with actual IDs.
- All endpoints return JSON. Error responses include a `message` field.

---
