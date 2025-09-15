module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Faculties
    await queryInterface.bulkInsert('faculties', [
      {
        id: '11111111-1111-1111-1111-111111111111',
        name: 'Faculty of Science',
        deanName: 'Dr. Alice Dean',
        contactInfo: 'science@university.edu',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        name: 'Faculty of Engineering',
        deanName: 'Dr. Bob Dean',
        contactInfo: 'engineering@university.edu',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // Degree Programs
    await queryInterface.bulkInsert('degree_programs', [
      {
        id: '33333333-3333-3333-3333-333333333333',
        name: 'BSc Computer Science',
        duration: 4,
        facultyId: '11111111-1111-1111-1111-111111111111',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '44444444-4444-4444-4444-444444444444',
        name: 'BEng Civil Engineering',
        duration: 4,
        facultyId: '22222222-2222-2222-2222-222222222222',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // Degree Rules
    await queryInterface.bulkInsert('degree_rules', [
      {
        id: '55555555-5555-5555-5555-555555555555',
        degreeProgramId: '33333333-3333-3333-3333-333333333333',
        minCreditsToGraduate: 120,
        minCGPARequired: 2.0,
        honorsCriteria: 'First Class = CGPA ≥ 3.7',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '66666666-6666-6666-6666-666666666666',
        degreeProgramId: '44444444-4444-4444-4444-444444444444',
        minCreditsToGraduate: 120,
        minCGPARequired: 2.0,
        honorsCriteria: 'First Class = CGPA ≥ 3.7',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // Grading System
    await queryInterface.bulkInsert('grading_systems', [
      {
        id: '77777777-7777-7777-7777-777777777777',
        gradeLetter: 'A',
        minMarks: 80,
        maxMarks: 100,
        gradePoint: 4.0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '88888888-8888-8888-8888-888888888888',
        gradeLetter: 'B',
        minMarks: 70,
        maxMarks: 79,
        gradePoint: 3.0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '99999999-9999-9999-9999-999999999999',
        gradeLetter: 'C',
        minMarks: 60,
        maxMarks: 69,
        gradePoint: 2.0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        gradeLetter: 'D',
        minMarks: 50,
        maxMarks: 59,
        gradePoint: 1.0,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        gradeLetter: 'F',
        minMarks: 0,
        maxMarks: 49,
        gradePoint: 0.0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('faculties', null, {});
    await queryInterface.bulkDelete('degree_programs', null, {});
    await queryInterface.bulkDelete('degree_rules', null, {});
    await queryInterface.bulkDelete('grading_systems', null, {});
  }
};


// npx sequelize-cli db:seed:all --config src/config/database.js --seeders-path database/seeders
// npx sequelize-cli db:seed:undo:all --config src/config/database.js --seeders-path database/seeders
// npx sequelize-cli db:seed:all --config src/config/database.js --seeders-path database/seeders

