# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Option 1: Docker PostgreSQL (Recommended)

1. **Prerequisites**: Install Docker Desktop
2. **Start PostgreSQL**:
   ```bash
   docker-compose up -d postgres
   ```
3. **Setup Environment**:
   ```bash
   cp .env.example .env
   npm install
   ```
4. **Start the Server**:
   ```bash
   npm run dev
   ```
5. **Test APIs**:
   ```bash
   # Linux/Mac
   chmod +x test-apis.sh
   ./test-apis.sh
   
   # Windows
   test-apis.bat
   ```

### Option 2: Cloud PostgreSQL (No local installation)

1. **Get a free PostgreSQL database**:
   - Supabase: https://supabase.com (free tier)
   - Neon: https://neon.tech (free tier)
   - ElephantSQL: https://elephantsql.com (free tier)

2. **Update .env file** with your cloud database credentials:
   ```env
   DB_HOST=your-cloud-host
   DB_PORT=5432
   DB_NAME=your-database
   DB_USER=your-username
   DB_PASSWORD=your-password
   ```

3. **Install and Start**:
   ```bash
   npm install
   npm run dev
   ```

## 📋 JWT Authentication Summary

### Public Endpoints (No JWT required):
- `GET /health` - Health check
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Protected Endpoints (JWT required):
- **All other endpoints require**: `Authorization: Bearer <your-jwt-token>`

### How to use JWT:
1. **Login** to get token:
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@sis.com","password":"admin123"}'
   ```

2. **Use token** in subsequent requests:
   ```bash
   curl -X GET http://localhost:3000/api/auth/me \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```

### Role-Based Access:
- **Super Admin**: Full access to everything
- **Admin**: Manage students, attendance, results
- **Student**: View own data only

## 🧪 Testing APIs

### Manual Testing with cURL:
See `API_TESTING_GUIDE.md` for comprehensive cURL examples.

### Automated Testing:
Run the test scripts to verify all APIs:
```bash
# Linux/Mac
./test-apis.sh

# Windows
test-apis.bat
```

## 🐘 PostgreSQL Setup Options

### 1. Docker (Easiest)
```bash
docker-compose up -d postgres
# Database will be available at localhost:5432
```

### 2. Cloud Services (No installation)
- **Supabase**: Free 500MB, no credit card required
- **Neon**: Free 3GB, PostgreSQL-compatible
- **ElephantSQL**: Free 20MB, perfect for testing

### 3. Local Installation
See `POSTGRESQL_SETUP.md` for detailed instructions.

## 🔧 Development Commands

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Run tests
npm test

# Install dependencies
npm install
```

## 📊 Default Users

After running the test script, you'll have:

1. **Super Admin**:
   - Email: admin@sis.com
   - Password: admin123
   - Role: super_admin

2. **Admin** (if created):
   - Email: teacher@sis.com
   - Password: auto-generated (check email or logs)
   - Role: admin

3. **Student** (if created):
   - Email: student@sis.com
   - Password: auto-generated (check email or logs)
   - Role: student

## 🌐 API Endpoints Overview

```
Authentication:
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
PUT  /api/auth/profile

Users:
GET  /api/users
POST /api/users
GET  /api/users/students
GET  /api/users/admins
GET  /api/users/:id
PUT  /api/users/:id
DELETE /api/users/:id

Attendance:
POST /api/attendance
GET  /api/attendance
GET  /api/attendance/:studentId
PUT  /api/attendance/:id
POST /api/attendance/bulk
```

## 🚨 Troubleshooting

### Database Connection Issues:
1. **Docker**: `docker-compose logs postgres`
2. **Local**: Check if PostgreSQL is running
3. **Cloud**: Verify credentials in .env

### Server Won't Start:
1. Check if port 3000 is available
2. Verify .env file exists and has correct values
3. Run `npm install` to ensure dependencies are installed

### Authentication Issues:
1. Ensure JWT_SECRET is set in .env
2. Check token format: `Bearer <token>`
3. Verify user exists and is active

## 🎯 Next Steps

1. **Frontend Integration**: Build a React/Vue/Angular frontend
2. **Add More Features**: Medical reports, payments, results
3. **Deploy**: Use PM2, Docker, or cloud platforms
4. **Monitor**: Add logging and monitoring tools

## 📚 Documentation

- `README.md` - Complete project documentation
- `API_TESTING_GUIDE.md` - Comprehensive API testing guide
- `POSTGRESQL_SETUP.md` - Database setup instructions

---

**🎉 You're all set! Your SIS Backend is ready for development.**
