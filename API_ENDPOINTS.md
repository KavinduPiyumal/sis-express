# SIS API Endpoints Documentation

All requests and responses are JSON. Authenticated endpoints require a valid JWT in an HttpOnly cookie (set by login).

---

## Authentication APIs

### Register
- **POST** `/api/auth/register`
- **Request:**
```json
{
  "firstName": "Super",
  "lastName": "Admin",
  "email": "admin@sis.com",
  "password": "admin123",
  "role": "super_admin"
}
```
- **cURL:**
```sh
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Super","lastName":"Admin","email":"admin@sis.com","password":"admin123","role":"super_admin"}'
```
- **Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": { "id": "uuid", "firstName": "Super", ... }
}
```

---

### Login
- **POST** `/api/auth/login`
- **Request:**
```json
{
  "email": "admin@sis.com",
  "password": "admin123"
}
```
- **cURL:**
```sh
curl -i -c cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sis.com","password":"admin123"}'
```
- **Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": { "id": "uuid", "firstName": "Super", ... }
}
```
- **Note:** JWT is set as HttpOnly cookie. Use `-b cookies.txt` for all further requests.

---

### Logout
- **POST** `/api/auth/logout`
- **cURL:**
```sh
curl -b cookies.txt -X POST http://localhost:3000/api/auth/logout
```
- **Response:**
```json
{ "success": true, "message": "Logout successful" }
```

---

### Get Current User Profile
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -b cookies.txt
```

### Update Profile
```bash
curl -X PUT http://localhost:3000/api/auth/profile \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Updated",
    "lastName": "Name",
    "phone": "+1234567890",
    "address": "123 Main St"
  }'
```

### Forgot Password
- **POST** `/api/auth/forgot-password`
- **Request:**
```json
{ "email": "user@example.com" }
```
- **cURL:**
```sh
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```
- **Response:**
```json
{ "success": true, "message": "If that email exists, a reset link has been sent." }
```

---

### Reset Password
- **POST** `/api/auth/reset-password`
- **Request:**
```json
{ "token": "RESET_TOKEN", "newPassword": "newPassword123" }
```
- **cURL:**
```sh
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"RESET_TOKEN","newPassword":"newPassword123"}'
```
- **Response:**
```json
{ "success": true, "message": "Password has been reset successfully." }
```

---

### Send Change Password OTP
- **POST** `/api/auth/send-change-password-otp`
- **cURL:**
```sh
curl -b cookies.txt -X POST http://localhost:3000/api/auth/send-change-password-otp
```
- **Response:**
```json
{ "success": true, "message": "OTP sent to your email." }
```

---

### Change Password (with OTP)
- **PUT** `/api/auth/change-password`
- **Request:**
```json
{ "currentPassword": "oldPass", "newPassword": "newPass", "otp": "123456" }
```
- **cURL:**
```sh
curl -b cookies.txt -X PUT http://localhost:3000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"oldPass","newPassword":"newPass","otp":"123456"}'
```
- **Response:**
```json
{ "success": true, "message": "Password changed successfully" }
```

---

## User APIs

### Get All Users
- **GET** `/api/users`
- **cURL:**
```sh
curl -b cookies.txt -X GET http://localhost:3000/api/users
```
- **Response:**
```json
{ "success": true, "data": [ { "id": "uuid", ... } ] }
```

---

### Create User
- **POST** `/api/users`
- **Request:**
```json
{ "firstName": "Jane", "lastName": "Student", "email": "student@sis.com", "role": "student", "studentId": "STU001", "password": "student123" }
```
- **cURL:**
```sh
curl -b cookies.txt -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Jane","lastName":"Student","email":"student@sis.com","role":"student","studentId":"STU001","password":"student123"}'
```
- **Response:**
```json
{ "success": true, "message": "User created successfully", "data": { "id": "uuid", ... } }
```

---

### Get User by ID
- **GET** `/api/users/:id`
- **cURL:**
```sh
curl -b cookies.txt -X GET http://localhost:3000/api/users/USER_ID_HERE
```
- **Response:**
```json
{ "success": true, "data": { "id": "uuid", ... } }
```

---

### Update User
- **PUT** `/api/users/:id`
- **Request:**
```json
{ "firstName": "Jane", "lastName": "Doe", "phone": "+1234567890" }
```
- **cURL:**
```sh
curl -b cookies.txt -X PUT http://localhost:3000/api/users/USER_ID_HERE \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Jane","lastName":"Doe","phone":"+1234567890"}'
```
- **Response:**
```json
{ "success": true, "message": "User updated successfully", "data": { "id": "uuid", ... } }
```

---

### Delete User
- **DELETE** `/api/users/:id`
- **cURL:**
```sh
curl -b cookies.txt -X DELETE http://localhost:3000/api/users/USER_ID_HERE
```
- **Response:**
```json
{ "success": true, "message": "User deleted successfully" }
```

---

## Attendance APIs

### Record Attendance
- **POST** `/api/attendance`
- **Request:**
```json
{ "studentId": "STUDENT_ID_HERE", "date": "2024-01-15", "status": "present", "subject": "Mathematics", "notes": "Regular class" }
```
- **cURL:**
```sh
curl -b cookies.txt -X POST http://localhost:3000/api/attendance \
  -H "Content-Type: application/json" \
  -d '{"studentId":"STUDENT_ID_HERE","date":"2024-01-15","status":"present","subject":"Mathematics","notes":"Regular class"}'
```
- **Response:**
```json
{ "success": true, "message": "Attendance recorded successfully", "data": { "id": "uuid", ... } }
```

---

### Get All Attendance Records
- **GET** `/api/attendance`
- **cURL:**
```sh
curl -b cookies.txt -X GET http://localhost:3000/api/attendance
```
- **Response:**
```json
{ "success": true, "data": [ { "id": "uuid", ... } ] }
```

---

### Get Student Attendance
- **GET** `/api/attendance/:studentId`
- **cURL:**
```sh
curl -b cookies.txt -X GET http://localhost:3000/api/attendance/STUDENT_ID_HERE
```
- **Response:**
```json
{ "success": true, "data": [ { "id": "uuid", ... } ] }
```

---

### Update Attendance
- **PUT** `/api/attendance/:id`
- **Request:**
```json
{ "status": "late", "notes": "Arrived 10 minutes late" }
```
- **cURL:**
```sh
curl -b cookies.txt -X PUT http://localhost:3000/api/attendance/ATTENDANCE_ID_HERE \
  -H "Content-Type: application/json" \
  -d '{"status":"late","notes":"Arrived 10 minutes late"}'
```
- **Response:**
```json
{ "success": true, "message": "Attendance updated successfully", "data": { "id": "uuid", ... } }
```

---

### Health Check
- **GET** `/health`
- **cURL:**
```sh
curl -X GET http://localhost:3000/health
```
- **Response:**
```json
{ "success": true, "message": "SIS Backend API is running", "timestamp": "...", "uptime": 123.45 }
```

---

> For all authenticated requests, use `-b cookies.txt` after logging in.
