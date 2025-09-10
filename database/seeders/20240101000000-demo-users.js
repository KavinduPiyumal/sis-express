const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    // Create Super Admin
    await queryInterface.bulkInsert('users', [
      {
        id: uuidv4(),
        firstName: 'Super',
        lastName: 'Admin',
        email: 'superadmin@sis.com',
        password: hashedPassword,
        role: 'super_admin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // Create Admin users
    const adminPassword = await bcrypt.hash('admin123', 12);
    await queryInterface.bulkInsert('users', [
      {
        id: uuidv4(),
        firstName: 'John',
        lastName: 'Teacher',
        email: 'john.teacher@sis.com',
        password: adminPassword,
        role: 'admin',
        phone: '+1234567890',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        firstName: 'Jane',
        lastName: 'Professor',
        email: 'jane.professor@sis.com',
        password: adminPassword,
        role: 'admin',
        phone: '+1234567891',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // Create Student users
    const studentPassword = await bcrypt.hash('student123', 12);
    const students = [];
    
    for (let i = 1; i <= 10; i++) {
      students.push({
        id: uuidv4(),
        firstName: `Student${i}`,
        lastName: `LastName${i}`,
        email: `student${i}@sis.com`,
        password: studentPassword,
        role: 'student',
        studentId: `STU${String(i).padStart(3, '0')}`,
        phone: `+123456789${i}`,
        dateOfBirth: new Date(2000 + i, 0, 15),
        address: `${i} Student Street, Education City`,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    await queryInterface.bulkInsert('users', students);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', null, {});
  }
};
