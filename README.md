# Student Information System (SIS) Backend

A comprehensive Student Information System backend built with Express.js, PostgreSQL, and Clean Architecture principles. This system provides role-based authentication, real-time notifications, and complete CRUD operations for managing students, attendance, medical reports, payments, results, and more.

## 🏗️ Architecture

This project follows **Clean Architecture** principles with clear separation of concerns:

```
src/
├── config/           # Configuration files
├── controllers/      # Presentation layer - API controllers
├── routes/          # API route definitions
├── usecases/        # Application layer - Business logic
├── services/        # Application services
├── entities/        # Domain layer - Database models
├── repositories/    # Data access layer
├── infrastructure/  # External services (email, sockets, database)
├── middlewares/     # Cross-cutting concerns
├── dto/            # Data Transfer Objects
└── app.js          # Application entry point
```

## 🚀 Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (Super Admin, Admin, Student)
- Secure password hashing with bcrypt
- Profile management and password change

### User Management
- User creation, update, and deletion
- Role-based user listings
- User statistics and analytics
- Account activation/deactivation

### Attendance Management
- Record, update, and view attendance
- Bulk attendance recording
- Attendance statistics and analytics
- Real-time notifications for absences

### Real-time Features
- Socket.IO for real-time notifications
- Email notifications with Nodemailer
- Live updates for important events

### Security Features
- Helmet.js for security headers
- Rate limiting to prevent abuse
- Input validation with express-validator
- CORS configuration
- Audit logging for all actions

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Real-time Communication**: Socket.IO
- **Email Service**: Nodemailer
- **File Upload**: Multer
- **Validation**: express-validator, Joi
- **Logging**: Winston
- **Security**: Helmet, CORS, express-rate-limit
- **Testing**: Jest, Supertest

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## ⚙️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sis-express
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=sis_database
   DB_USER=postgres
   DB_PASSWORD=your_password

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=7d

   # Server Configuration
   PORT=3000
   NODE_ENV=development

   # Email Configuration (optional)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password

   # File Upload Configuration
   UPLOAD_PATH=uploads/
   MAX_FILE_SIZE=5242880

   # Socket.IO Configuration
   SOCKET_CORS_ORIGIN=http://localhost:3001
   ```

4. **Set up PostgreSQL database**
   ```sql
   CREATE DATABASE sis_database;
   ```

5. **Create required directories**
   ```bash
   mkdir logs uploads
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Database Operations
```bash
# Run migrations (if using Sequelize CLI)
npm run db:migrate

# Seed database with sample data
npm run db:seed

# Reset database (drop, create, migrate, seed)
npm run db:reset
```

### Testing
```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "password123",
  "role": "student",
  "studentId": "STU001"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

#### Get Profile
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### User Management Endpoints

#### Get All Users (Super Admin only)
```http
GET /api/users?page=1&limit=10&search=john&role=student
Authorization: Bearer <token>
```

#### Create User (Super Admin only)
```http
POST /api/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@example.com",
  "role": "student",
  "studentId": "STU002"
}
```

#### Get Students (Admin access)
```http
GET /api/users/students
Authorization: Bearer <token>
```

### Attendance Endpoints

#### Record Attendance (Admin only)
```http
POST /api/attendance
Authorization: Bearer <token>
Content-Type: application/json

{
  "studentId": "uuid-here",
  "date": "2024-01-15",
  "status": "present",
  "subject": "Mathematics",
  "notes": "Optional notes"
}
```

#### Get Student Attendance
```http
GET /api/attendance/{studentId}?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

#### Bulk Record Attendance (Admin only)
```http
POST /api/attendance/bulk
Authorization: Bearer <token>
Content-Type: application/json

{
  "attendanceRecords": [
    {
      "studentId": "uuid-1",
      "date": "2024-01-15",
      "status": "present",
      "subject": "Mathematics"
    },
    {
      "studentId": "uuid-2",
      "date": "2024-01-15",
      "status": "absent",
      "subject": "Mathematics"
    }
  ]
}
```

## 🔐 User Roles & Permissions

### Super Admin
- Full system access
- Manage all users (create, update, delete)
- View all data and statistics
- System configuration

### Admin (Lecturer)
- Manage students
- Record and manage attendance
- Upload and manage results
- Create notices and links
- View system logs
- Approve/reject medical reports and payments

### Student
- View own profile and update personal information
- View own attendance records and statistics
- Submit medical reports with file uploads
- View notices and links
- Submit payment receipts
- View own results
- Receive real-time notifications

## 🔔 Real-time Notifications

The system supports real-time notifications using Socket.IO for:
- New notices published
- Results published
- Payment status updates
- Medical report status updates
- Attendance alerts

### Socket.IO Client Connection
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});

// Listen for notifications
socket.on('notification', (data) => {
  console.log('New notification:', data);
});

socket.on('new_notice', (data) => {
  console.log('New notice:', data);
});

socket.on('result_published', (data) => {
  console.log('New result:', data);
});
```

## 📧 Email Notifications

Automatic email notifications are sent for:
- User registration welcome emails
- Important system notifications
- Status updates for submissions

Configure your email settings in the `.env` file to enable email notifications.

## 🗃️ Database Schema

The system uses the following main entities:
- **Users** - System users (students, admins, super admins)
- **Attendance** - Daily attendance records
- **Medical Reports** - Student medical reports with file uploads
- **Notices** - System-wide announcements
- **Payments** - Student payment records with receipts
- **Results** - Academic results and grades
- **Links** - Useful resources and links
- **Notifications** - In-app notifications
- **Logs** - System audit logs

## 🧪 Testing

The project includes comprehensive tests using Jest and Supertest:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- auth.test.js
```

## 📝 Logging

The application uses Winston for logging with multiple transport levels:
- **Error logs**: `logs/error.log`
- **Combined logs**: `logs/combined.log`
- **Console output**: Development mode only

## 🔒 Security Considerations

- JWT tokens for stateless authentication
- Password hashing with bcrypt (12 rounds)
- Rate limiting to prevent abuse
- Input validation and sanitization
- CORS configuration
- Helmet.js for security headers
- File upload restrictions and validation
- SQL injection prevention with Sequelize ORM

## 🚀 Deployment

### Using PM2 (Recommended)
```bash
npm install -g pm2
pm2 start src/app.js --name "sis-backend"
pm2 startup
pm2 save
```

### Using Docker
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables for Production
Ensure the following environment variables are set in production:
- `NODE_ENV=production`
- `JWT_SECRET` (strong, unique secret)
- Database connection details
- Email configuration (if using)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the logs in the `logs/` directory
2. Verify your environment configuration
3. Ensure PostgreSQL is running and accessible
4. Check the API documentation for correct request formats

## 🔄 Health Check

The application provides a health check endpoint:
```http
GET /health
```

Response:
```json
{
  "success": true,
  "message": "SIS Backend API is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600
}
```

---

**Note**: This is a comprehensive backend system. Ensure you have the proper frontend application to interact with these APIs. The system is designed to work with modern frontend frameworks like React, Vue.js, or Angular.
