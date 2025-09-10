# API Testing Guide with cURL Commands

This document provides comprehensive cURL commands to test all APIs in the Student Information System.

## Prerequisites

1. **Start the server**: `npm run dev`
2. **Server URL**: `http://localhost:3000`
3. **Content-Type**: Always use `application/json` for POST/PUT requests

## Authentication Flow

### 1. Register a Super Admin (First User)
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Super",
    "lastName": "Admin",
    "email": "admin@sis.com",
    "password": "admin123",
    "role": "super_admin"
  }'
```

### 2. Login to Get JWT Token
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@sis.com",
    "password": "admin123"
  }'
```

**Response will contain a token - save this for subsequent requests:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {...},
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Set Token as Environment Variable (for easier testing)
```bash
# Linux/Mac
export TOKEN="your_jwt_token_here"

# Windows CMD
set TOKEN=your_jwt_token_here

# Windows PowerShell
$env:TOKEN="your_jwt_token_here"
```

## Authentication Endpoints

### Get Current User Profile
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### Update Profile
```bash
curl -X PUT http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Updated",
    "lastName": "Name",
    "phone": "+1234567890",
    "address": "123 Main St"
  }'
```

### Change Password
```bash
curl -X PUT http://localhost:3000/api/auth/change-password \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "admin123",
    "newPassword": "newpassword123"
  }'
```

### forgot password
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password ^
  -H "Content-Type: application/json" ^
  -d "{\"email\": \"user@example.com\"}"
```

### reset password
```bash
curl -X POST http://localhost:3000/api/auth/reset-password ^
  -H "Content-Type: application/json" ^
  -d "{\"token\": \"PASTE_TOKEN_FROM_EMAIL\", \"newPassword\": \"yourNewPassword123\"}"
```
### Logout
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

## User Management Endpoints (Super Admin Required)

### Create a New Admin
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Teacher",
    "email": "teacher@sis.com",
    "role": "admin"
  }'
```

### Create a New Student
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Student",
    "email": "student@sis.com",
    "role": "student",
    "studentId": "STU001",
    "dateOfBirth": "2000-01-15"
  }'
```

### Get All Users (with pagination and filters)
```bash
curl -X GET "http://localhost:3000/api/users?page=1&limit=10&search=jane&role=student" \
  -H "Authorization: Bearer $TOKEN"
```

### Get User Statistics
```bash
curl -X GET http://localhost:3000/api/users/stats \
  -H "Authorization: Bearer $TOKEN"
```

### Get All Students
```bash
curl -X GET http://localhost:3000/api/users/students \
  -H "Authorization: Bearer $TOKEN"
```

### Get All Admins
```bash
curl -X GET http://localhost:3000/api/users/admins \
  -H "Authorization: Bearer $TOKEN"
```

### Get User by ID
```bash
curl -X GET http://localhost:3000/api/users/USER_ID_HERE \
  -H "Authorization: Bearer $TOKEN"
```

### Update User
```bash
curl -X PUT http://localhost:3000/api/users/USER_ID_HERE \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Updated",
    "lastName": "Student",
    "phone": "+1234567890",
    "isActive": true
  }'
```

### Delete User (Soft Delete)
```bash
curl -X DELETE http://localhost:3000/api/users/USER_ID_HERE \
  -H "Authorization: Bearer $TOKEN"
```

## Attendance Endpoints

### Record Attendance (Admin Required)
```bash
curl -X POST http://localhost:3000/api/attendance \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "STUDENT_ID_HERE",
    "date": "2024-01-15",
    "status": "present",
    "subject": "Mathematics",
    "notes": "Regular class"
  }'
```

### Record Bulk Attendance
```bash
curl -X POST http://localhost:3000/api/attendance/bulk \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "attendanceRecords": [
      {
        "studentId": "STUDENT_ID_1",
        "date": "2024-01-15",
        "status": "present",
        "subject": "Mathematics"
      },
      {
        "studentId": "STUDENT_ID_2",
        "date": "2024-01-15",
        "status": "absent",
        "subject": "Mathematics"
      }
    ]
  }'
```

### Get All Attendance Records (Admin View)
```bash
curl -X GET "http://localhost:3000/api/attendance?page=1&limit=10&date=2024-01-15&status=present" \
  -H "Authorization: Bearer $TOKEN"
```

### Get Student Attendance
```bash
curl -X GET "http://localhost:3000/api/attendance/STUDENT_ID_HERE?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer $TOKEN"
```

### Get Attendance Statistics
```bash
curl -X GET "http://localhost:3000/api/attendance/STUDENT_ID_HERE/stats?startDate=2024-01-01&endDate=2024-01-31" \
  -H "Authorization: Bearer $TOKEN"
```

### Update Attendance Record
```bash
curl -X PUT http://localhost:3000/api/attendance/ATTENDANCE_ID_HERE \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "late",
    "notes": "Arrived 10 minutes late"
  }'
```

## Health Check Endpoint (No Authentication Required)

### Check API Health
```bash
curl -X GET http://localhost:3000/health
```

## Testing Script Example

Create a file `test-apis.sh` (Linux/Mac) or `test-apis.bat` (Windows):

```bash
#!/bin/bash

# Base URL
BASE_URL="http://localhost:3000"

echo "=== Testing SIS Backend APIs ==="

# 1. Health Check
echo "1. Testing Health Check..."
curl -s -X GET $BASE_URL/health | jq '.'

# 2. Register Super Admin
echo "2. Registering Super Admin..."
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Super",
    "lastName": "Admin",
    "email": "admin@sis.com",
    "password": "admin123",
    "role": "super_admin"
  }')
echo $REGISTER_RESPONSE | jq '.'

# 3. Login
echo "3. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@sis.com",
    "password": "admin123"
  }')
echo $LOGIN_RESPONSE | jq '.'

# Extract token
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')
echo "Token: $TOKEN"

# 4. Get Profile
echo "4. Getting Profile..."
curl -s -X GET $BASE_URL/api/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# 5. Create Student
echo "5. Creating Student..."
STUDENT_RESPONSE=$(curl -s -X POST $BASE_URL/api/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Student",
    "email": "student@sis.com",
    "role": "student",
    "studentId": "STU001"
  }')
echo $STUDENT_RESPONSE | jq '.'

# Extract student ID
STUDENT_ID=$(echo $STUDENT_RESPONSE | jq -r '.data.id')
echo "Student ID: $STUDENT_ID"

# 6. Record Attendance
echo "6. Recording Attendance..."
curl -s -X POST $BASE_URL/api/attendance \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"studentId\": \"$STUDENT_ID\",
    \"date\": \"$(date +%Y-%m-%d)\",
    \"status\": \"present\",
    \"subject\": \"Mathematics\"
  }" | jq '.'

echo "=== API Testing Complete ==="
```

## JWT Authentication Details

### Which APIs Require JWT?

**No Authentication Required:**
- `GET /health` - Health check
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-token` - Token verification

**Authentication Required (All Others):**
- All `/api/auth/*` endpoints (except above)
- All `/api/users/*` endpoints
- All `/api/attendance/*` endpoints
- All future endpoints (medical reports, payments, etc.)

### JWT Token Format
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Payload Contains:
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "role": "student|admin|super_admin",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Role-Based Access Control:

**Super Admin:**
- Full access to all endpoints
- Can create/manage all users
- View all system data

**Admin:**
- Manage students
- Record attendance
- View system logs
- Cannot manage other admins

**Student:**
- View own profile
- View own attendance
- Submit medical reports/payments
- Cannot access other users' data

## Error Responses

### Authentication Errors:
```json
{
  "success": false,
  "message": "Access token is required"
}
```

### Authorization Errors:
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

### Validation Errors:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Valid email is required",
      "value": "invalid-email"
    }
  ]
}
```
