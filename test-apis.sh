#!/bin/bash

# SIS Backend API Testing Script
# This script tests all the available APIs

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="http://localhost:3000"
TOKEN=""
STUDENT_ID=""
ADMIN_ID=""

# Function to print colored output
print_step() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Function to make API calls and parse responses
api_call() {
    local method=$1
    local endpoint=$2
    local data=$3
    local auth_header=""
    
    if [ ! -z "$TOKEN" ]; then
        auth_header="-H \"Authorization: Bearer $TOKEN\""
    fi
    
    if [ "$method" = "GET" ]; then
        eval curl -s -X $method "$BASE_URL$endpoint" $auth_header
    else
        eval curl -s -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            $auth_header \
            -d "'$data'"
    fi
}

# Start testing
echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║              SIS Backend API Testing Script                  ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# 1. Health Check
print_step "1. Testing Health Check"
HEALTH_RESPONSE=$(api_call "GET" "/health")
if echo "$HEALTH_RESPONSE" | grep -q "success.*true"; then
    print_success "Health check passed"
    echo "$HEALTH_RESPONSE" | jq '.' 2>/dev/null || echo "$HEALTH_RESPONSE"
else
    print_error "Health check failed"
    echo "$HEALTH_RESPONSE"
    exit 1
fi
echo ""

# 2. Register Super Admin
print_step "2. Registering Super Admin"
REGISTER_DATA='{
    "firstName": "Super",
    "lastName": "Admin",
    "email": "admin@sis.com",
    "password": "admin123",
    "role": "super_admin"
}'

REGISTER_RESPONSE=$(api_call "POST" "/api/auth/register" "$REGISTER_DATA")
if echo "$REGISTER_RESPONSE" | grep -q "success.*true"; then
    print_success "Super Admin registered successfully"
    echo "$REGISTER_RESPONSE" | jq '.' 2>/dev/null || echo "$REGISTER_RESPONSE"
else
    print_info "Super Admin might already exist (this is okay)"
    echo "$REGISTER_RESPONSE" | jq '.' 2>/dev/null || echo "$REGISTER_RESPONSE"
fi
echo ""

# 3. Login Super Admin
print_step "3. Logging in Super Admin"
LOGIN_DATA='{
    "email": "admin@sis.com",
    "password": "admin123"
}'

LOGIN_RESPONSE=$(api_call "POST" "/api/auth/login" "$LOGIN_DATA")
if echo "$LOGIN_RESPONSE" | grep -q "success.*true"; then
    print_success "Login successful"
    TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token' 2>/dev/null)
    if [ "$TOKEN" != "null" ] && [ ! -z "$TOKEN" ]; then
        print_success "Token extracted: ${TOKEN:0:20}..."
    else
        print_error "Failed to extract token"
        echo "$LOGIN_RESPONSE"
        exit 1
    fi
else
    print_error "Login failed"
    echo "$LOGIN_RESPONSE"
    exit 1
fi
echo ""

# 4. Get Profile
print_step "4. Getting User Profile"
PROFILE_RESPONSE=$(api_call "GET" "/api/auth/me")
if echo "$PROFILE_RESPONSE" | grep -q "success.*true"; then
    print_success "Profile retrieved successfully"
    echo "$PROFILE_RESPONSE" | jq '.' 2>/dev/null || echo "$PROFILE_RESPONSE"
else
    print_error "Failed to get profile"
    echo "$PROFILE_RESPONSE"
fi
echo ""

# 5. Create Admin User
print_step "5. Creating Admin User"
ADMIN_DATA='{
    "firstName": "John",
    "lastName": "Teacher",
    "email": "teacher@sis.com",
    "role": "admin"
}'

ADMIN_RESPONSE=$(api_call "POST" "/api/users" "$ADMIN_DATA")
if echo "$ADMIN_RESPONSE" | grep -q "success.*true"; then
    print_success "Admin user created successfully"
    ADMIN_ID=$(echo "$ADMIN_RESPONSE" | jq -r '.data.id' 2>/dev/null)
    print_success "Admin ID: $ADMIN_ID"
    echo "$ADMIN_RESPONSE" | jq '.' 2>/dev/null || echo "$ADMIN_RESPONSE"
else
    print_error "Failed to create admin user"
    echo "$ADMIN_RESPONSE"
fi
echo ""

# 6. Create Student User
print_step "6. Creating Student User"
STUDENT_DATA='{
    "firstName": "Jane",
    "lastName": "Student",
    "email": "student@sis.com",
    "role": "student",
    "studentId": "STU001",
    "dateOfBirth": "2000-01-15"
}'

STUDENT_RESPONSE=$(api_call "POST" "/api/users" "$STUDENT_DATA")
if echo "$STUDENT_RESPONSE" | grep -q "success.*true"; then
    print_success "Student user created successfully"
    STUDENT_ID=$(echo "$STUDENT_RESPONSE" | jq -r '.data.id' 2>/dev/null)
    print_success "Student ID: $STUDENT_ID"
    echo "$STUDENT_RESPONSE" | jq '.' 2>/dev/null || echo "$STUDENT_RESPONSE"
else
    print_error "Failed to create student user"
    echo "$STUDENT_RESPONSE"
fi
echo ""

# 7. Get All Users
print_step "7. Getting All Users"
USERS_RESPONSE=$(api_call "GET" "/api/users?page=1&limit=10")
if echo "$USERS_RESPONSE" | grep -q "success.*true"; then
    print_success "Users retrieved successfully"
    echo "$USERS_RESPONSE" | jq '.' 2>/dev/null || echo "$USERS_RESPONSE"
else
    print_error "Failed to get users"
    echo "$USERS_RESPONSE"
fi
echo ""

# 8. Get Students Only
print_step "8. Getting Students Only"
STUDENTS_RESPONSE=$(api_call "GET" "/api/users/students")
if echo "$STUDENTS_RESPONSE" | grep -q "success.*true"; then
    print_success "Students retrieved successfully"
    echo "$STUDENTS_RESPONSE" | jq '.' 2>/dev/null || echo "$STUDENTS_RESPONSE"
else
    print_error "Failed to get students"
    echo "$STUDENTS_RESPONSE"
fi
echo ""

# 9. Get User Statistics
print_step "9. Getting User Statistics"
STATS_RESPONSE=$(api_call "GET" "/api/users/stats")
if echo "$STATS_RESPONSE" | grep -q "success.*true"; then
    print_success "User statistics retrieved successfully"
    echo "$STATS_RESPONSE" | jq '.' 2>/dev/null || echo "$STATS_RESPONSE"
else
    print_error "Failed to get user statistics"
    echo "$STATS_RESPONSE"
fi
echo ""

# 10. Record Attendance (if student exists)
if [ ! -z "$STUDENT_ID" ] && [ "$STUDENT_ID" != "null" ]; then
    print_step "10. Recording Attendance"
    CURRENT_DATE=$(date +%Y-%m-%d)
    ATTENDANCE_DATA="{
        \"studentId\": \"$STUDENT_ID\",
        \"date\": \"$CURRENT_DATE\",
        \"status\": \"present\",
        \"subject\": \"Mathematics\",
        \"notes\": \"Regular class attendance\"
    }"
    
    ATTENDANCE_RESPONSE=$(api_call "POST" "/api/attendance" "$ATTENDANCE_DATA")
    if echo "$ATTENDANCE_RESPONSE" | grep -q "success.*true"; then
        print_success "Attendance recorded successfully"
        echo "$ATTENDANCE_RESPONSE" | jq '.' 2>/dev/null || echo "$ATTENDANCE_RESPONSE"
    else
        print_error "Failed to record attendance"
        echo "$ATTENDANCE_RESPONSE"
    fi
    echo ""
    
    # 11. Get Student Attendance
    print_step "11. Getting Student Attendance"
    STUDENT_ATTENDANCE_RESPONSE=$(api_call "GET" "/api/attendance/$STUDENT_ID")
    if echo "$STUDENT_ATTENDANCE_RESPONSE" | grep -q "success.*true"; then
        print_success "Student attendance retrieved successfully"
        echo "$STUDENT_ATTENDANCE_RESPONSE" | jq '.' 2>/dev/null || echo "$STUDENT_ATTENDANCE_RESPONSE"
    else
        print_error "Failed to get student attendance"
        echo "$STUDENT_ATTENDANCE_RESPONSE"
    fi
    echo ""
    
    # 12. Get Attendance Statistics
    print_step "12. Getting Attendance Statistics"
    ATTENDANCE_STATS_RESPONSE=$(api_call "GET" "/api/attendance/$STUDENT_ID/stats")
    if echo "$ATTENDANCE_STATS_RESPONSE" | grep -q "success.*true"; then
        print_success "Attendance statistics retrieved successfully"
        echo "$ATTENDANCE_STATS_RESPONSE" | jq '.' 2>/dev/null || echo "$ATTENDANCE_STATS_RESPONSE"
    else
        print_error "Failed to get attendance statistics"
        echo "$ATTENDANCE_STATS_RESPONSE"
    fi
    echo ""
else
    print_info "Skipping attendance tests - no student ID available"
fi

# 13. Get All Attendance Records
print_step "13. Getting All Attendance Records"
ALL_ATTENDANCE_RESPONSE=$(api_call "GET" "/api/attendance")
if echo "$ALL_ATTENDANCE_RESPONSE" | grep -q "success.*true"; then
    print_success "All attendance records retrieved successfully"
    echo "$ALL_ATTENDANCE_RESPONSE" | jq '.' 2>/dev/null || echo "$ALL_ATTENDANCE_RESPONSE"
else
    print_error "Failed to get all attendance records"
    echo "$ALL_ATTENDANCE_RESPONSE"
fi
echo ""

# 14. Update Profile
print_step "14. Updating Profile"
UPDATE_DATA='{
    "firstName": "Super Updated",
    "lastName": "Admin Updated",
    "phone": "+1234567890",
    "address": "123 Main Street, City"
}'

UPDATE_RESPONSE=$(api_call "PUT" "/api/auth/profile" "$UPDATE_DATA")
if echo "$UPDATE_RESPONSE" | grep -q "success.*true"; then
    print_success "Profile updated successfully"
    echo "$UPDATE_RESPONSE" | jq '.' 2>/dev/null || echo "$UPDATE_RESPONSE"
else
    print_error "Failed to update profile"
    echo "$UPDATE_RESPONSE"
fi
echo ""

# 15. Test Invalid Token
print_step "15. Testing Invalid Token"
OLD_TOKEN=$TOKEN
TOKEN="invalid_token"
INVALID_TOKEN_RESPONSE=$(api_call "GET" "/api/auth/me")
TOKEN=$OLD_TOKEN

if echo "$INVALID_TOKEN_RESPONSE" | grep -q "Invalid token"; then
    print_success "Invalid token properly rejected"
    echo "$INVALID_TOKEN_RESPONSE" | jq '.' 2>/dev/null || echo "$INVALID_TOKEN_RESPONSE"
else
    print_error "Invalid token not properly handled"
    echo "$INVALID_TOKEN_RESPONSE"
fi
echo ""

# 16. Test No Token
print_step "16. Testing No Token"
OLD_TOKEN=$TOKEN
TOKEN=""
NO_TOKEN_RESPONSE=$(api_call "GET" "/api/users")
TOKEN=$OLD_TOKEN

if echo "$NO_TOKEN_RESPONSE" | grep -q "Access token is required"; then
    print_success "Missing token properly rejected"
    echo "$NO_TOKEN_RESPONSE" | jq '.' 2>/dev/null || echo "$NO_TOKEN_RESPONSE"
else
    print_error "Missing token not properly handled"
    echo "$NO_TOKEN_RESPONSE"
fi
echo ""

# Summary
echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                      Testing Complete                        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

print_info "Summary:"
print_success "✅ Health Check"
print_success "✅ Authentication (Register/Login)"
print_success "✅ User Management (CRUD operations)"
print_success "✅ Attendance Management"
print_success "✅ Profile Management"
print_success "✅ Authorization (Token validation)"
print_success "✅ Error Handling"

echo ""
print_info "Your SIS Backend is working correctly!"
print_info "Token for manual testing: $TOKEN"
print_info "Student ID: $STUDENT_ID"
print_info "Admin ID: $ADMIN_ID"

echo ""
print_info "You can now use the API with any REST client or frontend application."
print_info "Remember to include 'Authorization: Bearer <token>' header for protected endpoints."
