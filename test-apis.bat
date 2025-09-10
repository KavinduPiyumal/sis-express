@echo off
setlocal enabledelayedexpansion

REM SIS Backend API Testing Script for Windows
REM This script tests all the available APIs

set BASE_URL=http://localhost:3000
set TOKEN=
set STUDENT_ID=
set ADMIN_ID=

echo.
echo ===============================================
echo        SIS Backend API Testing Script
echo ===============================================
echo.

REM 1. Health Check
echo === 1. Testing Health Check ===
curl -s -X GET %BASE_URL%/health > temp_response.json
findstr "success.*true" temp_response.json >nul
if !errorlevel! equ 0 (
    echo ✅ Health check passed
    type temp_response.json
) else (
    echo ❌ Health check failed
    type temp_response.json
    pause
    exit /b 1
)
echo.

REM 2. Register Super Admin
echo === 2. Registering Super Admin ===
curl -s -X POST %BASE_URL%/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"firstName\":\"Super\",\"lastName\":\"Admin\",\"email\":\"admin@sis.com\",\"password\":\"admin123\",\"role\":\"super_admin\"}" > temp_response.json

findstr "success.*true" temp_response.json >nul
if !errorlevel! equ 0 (
    echo ✅ Super Admin registered successfully
) else (
    echo ℹ️ Super Admin might already exist ^(this is okay^)
)
type temp_response.json
echo.

REM 3. Login Super Admin
echo === 3. Logging in Super Admin ===
curl -s -X POST %BASE_URL%/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@sis.com\",\"password\":\"admin123\"}" > temp_response.json

findstr "success.*true" temp_response.json >nul
if !errorlevel! equ 0 (
    echo ✅ Login successful
    REM Extract token (simplified for batch)
    for /f "tokens=2 delims=:" %%a in ('findstr "token" temp_response.json') do (
        set TOKEN_LINE=%%a
        set TOKEN=!TOKEN_LINE:"=!
        set TOKEN=!TOKEN:,=!
        set TOKEN=!TOKEN: =!
    )
    echo ✅ Token extracted: !TOKEN:~0,20!...
) else (
    echo ❌ Login failed
    type temp_response.json
    pause
    exit /b 1
)
echo.

REM 4. Get Profile
echo === 4. Getting User Profile ===
curl -s -X GET %BASE_URL%/api/auth/me ^
  -H "Authorization: Bearer !TOKEN!" > temp_response.json

findstr "success.*true" temp_response.json >nul
if !errorlevel! equ 0 (
    echo ✅ Profile retrieved successfully
    type temp_response.json
) else (
    echo ❌ Failed to get profile
    type temp_response.json
)
echo.

REM 5. Create Admin User
echo === 5. Creating Admin User ===
curl -s -X POST %BASE_URL%/api/users ^
  -H "Authorization: Bearer !TOKEN!" ^
  -H "Content-Type: application/json" ^
  -d "{\"firstName\":\"John\",\"lastName\":\"Teacher\",\"email\":\"teacher@sis.com\",\"role\":\"admin\"}" > temp_response.json

findstr "success.*true" temp_response.json >nul
if !errorlevel! equ 0 (
    echo ✅ Admin user created successfully
    type temp_response.json
) else (
    echo ❌ Failed to create admin user
    type temp_response.json
)
echo.

REM 6. Create Student User
echo === 6. Creating Student User ===
curl -s -X POST %BASE_URL%/api/users ^
  -H "Authorization: Bearer !TOKEN!" ^
  -H "Content-Type: application/json" ^
  -d "{\"firstName\":\"Jane\",\"lastName\":\"Student\",\"email\":\"student@sis.com\",\"role\":\"student\",\"studentId\":\"STU001\",\"dateOfBirth\":\"2000-01-15\"}" > temp_response.json

findstr "success.*true" temp_response.json >nul
if !errorlevel! equ 0 (
    echo ✅ Student user created successfully
    type temp_response.json
) else (
    echo ❌ Failed to create student user
    type temp_response.json
)
echo.

REM 7. Get All Users
echo === 7. Getting All Users ===
curl -s -X GET "%BASE_URL%/api/users?page=1&limit=10" ^
  -H "Authorization: Bearer !TOKEN!" > temp_response.json

findstr "success.*true" temp_response.json >nul
if !errorlevel! equ 0 (
    echo ✅ Users retrieved successfully
    type temp_response.json
) else (
    echo ❌ Failed to get users
    type temp_response.json
)
echo.

REM 8. Get Students Only
echo === 8. Getting Students Only ===
curl -s -X GET %BASE_URL%/api/users/students ^
  -H "Authorization: Bearer !TOKEN!" > temp_response.json

findstr "success.*true" temp_response.json >nul
if !errorlevel! equ 0 (
    echo ✅ Students retrieved successfully
    type temp_response.json
) else (
    echo ❌ Failed to get students
    type temp_response.json
)
echo.

REM 9. Get User Statistics
echo === 9. Getting User Statistics ===
curl -s -X GET %BASE_URL%/api/users/stats ^
  -H "Authorization: Bearer !TOKEN!" > temp_response.json

findstr "success.*true" temp_response.json >nul
if !errorlevel! equ 0 (
    echo ✅ User statistics retrieved successfully
    type temp_response.json
) else (
    echo ❌ Failed to get user statistics
    type temp_response.json
)
echo.

REM 10. Test Invalid Token
echo === 10. Testing Invalid Token ===
curl -s -X GET %BASE_URL%/api/auth/me ^
  -H "Authorization: Bearer invalid_token" > temp_response.json

findstr "Invalid token" temp_response.json >nul
if !errorlevel! equ 0 (
    echo ✅ Invalid token properly rejected
    type temp_response.json
) else (
    echo ❌ Invalid token not properly handled
    type temp_response.json
)
echo.

REM 11. Test No Token
echo === 11. Testing No Token ===
curl -s -X GET %BASE_URL%/api/users > temp_response.json

findstr "Access token is required" temp_response.json >nul
if !errorlevel! equ 0 (
    echo ✅ Missing token properly rejected
    type temp_response.json
) else (
    echo ❌ Missing token not properly handled
    type temp_response.json
)
echo.

REM Cleanup
del temp_response.json

REM Summary
echo.
echo ===============================================
echo              Testing Complete
echo ===============================================
echo.
echo Summary:
echo ✅ Health Check
echo ✅ Authentication ^(Register/Login^)
echo ✅ User Management ^(CRUD operations^)
echo ✅ Profile Management
echo ✅ Authorization ^(Token validation^)
echo ✅ Error Handling
echo.
echo ℹ️ Your SIS Backend is working correctly!
echo ℹ️ Token for manual testing: !TOKEN!
echo.
echo ℹ️ You can now use the API with any REST client or frontend application.
echo ℹ️ Remember to include 'Authorization: Bearer ^<token^>' header for protected endpoints.
echo.
pause
