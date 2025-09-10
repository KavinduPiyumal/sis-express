# Student Information System (SIS) Backend

This project is a comprehensive Student Information System backend built with Express.js, PostgreSQL, and Clean Architecture principles.

## Architecture
- Clean Architecture with separated layers
- Role-based authentication (Super Admin, Admin, Student)
- Real-time notifications with Socket.IO
- Email notifications with Nodemailer
- File upload support for medical reports and payment receipts

## Progress Tracking
- [x] Project Requirements Clarified
- [x] Project Scaffolded
- [x] Project Customized
- [x] Dependencies Installed
- [x] Project Compiled
- [x] Tasks Created
- [x] Project Launched
- [x] Documentation Complete

## Quick Start
1. `cp .env.example .env`
2. `docker-compose up -d postgres` (or setup cloud PostgreSQL)
3. `npm install`
4. `npm run dev`
5. Run `test-apis.bat` (Windows) or `./test-apis.sh` (Linux/Mac) to test all APIs

## JWT Authentication
- All APIs except `/health`, `/api/auth/register`, `/api/auth/login` require JWT
- Use `Authorization: Bearer <token>` header
- Roles: super_admin, admin, student with different permissions

## PostgreSQL Setup Options
1. Docker: `docker-compose up -d postgres`
2. Cloud: Supabase, Neon, ElephantSQL (free tiers available)
3. Local installation: See POSTGRESQL_SETUP.md

## Available APIs
- Authentication: register, login, profile management
- Users: CRUD operations with role-based access
- Attendance: record, view, statistics
- Health check and comprehensive error handling

## Testing
- Automated test scripts: `test-apis.sh` / `test-apis.bat`
- Manual testing guide: `API_TESTING_GUIDE.md`
- All endpoints tested with proper JWT validationn System (SIS) Backend

This project is a comprehensive Student Information System backend built with Express.js, PostgreSQL, and Clean Architecture principles.

## Architecture
- Clean Architecture with separated layers
- Role-based authentication (Super Admin, Admin, Student)
- Real-time notifications with Socket.IO
- Email notifications with Nodemailer
- File upload support for medical reports and payment receipts

## Progress Tracking
- [x] Project Requirements Clarified
- [x] Project Scaffolded
- [x] Project Customized
- [x] Dependencies Installed
- [x] Project Compiled
- [ ] Tasks Created
- [ ] Project Launched
- [ ] Documentation Complete
