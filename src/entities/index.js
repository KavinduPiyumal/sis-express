const User = require('./User');
const Attendance = require('./Attendance');
const MedicalReport = require('./MedicalReport');
const Notice = require('./Notice');
const Payment = require('./Payment');
const Result = require('./Result');
const Log = require('./Log');
const Link = require('./Link');
const Notification = require('./Notification');

// Define associations
User.hasMany(Attendance, { foreignKey: 'studentId', as: 'attendances' });
Attendance.belongsTo(User, { foreignKey: 'studentId', as: 'student' });
Attendance.belongsTo(User, { foreignKey: 'recordedBy', as: 'recorder' });

User.hasMany(MedicalReport, { foreignKey: 'studentId', as: 'medicalReports' });
MedicalReport.belongsTo(User, { foreignKey: 'studentId', as: 'student' });
MedicalReport.belongsTo(User, { foreignKey: 'reviewedBy', as: 'reviewer' });

User.hasMany(Payment, { foreignKey: 'studentId', as: 'payments' });
Payment.belongsTo(User, { foreignKey: 'studentId', as: 'student' });
Payment.belongsTo(User, { foreignKey: 'reviewedBy', as: 'reviewer' });

User.hasMany(Result, { foreignKey: 'studentId', as: 'results' });
Result.belongsTo(User, { foreignKey: 'studentId', as: 'student' });
Result.belongsTo(User, { foreignKey: 'uploadedBy', as: 'uploader' });

User.hasMany(Notice, { foreignKey: 'createdBy', as: 'notices' });
Notice.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

User.hasMany(Link, { foreignKey: 'createdBy', as: 'links' });
Link.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

User.hasMany(Log, { foreignKey: 'userId', as: 'logs' });
Log.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  User,
  Attendance,
  MedicalReport,
  Notice,
  Payment,
  Result,
  Log,
  Link,
  Notification
};
