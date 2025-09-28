// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // --- Faculty, Department, DegreeProgram, Batch demo data ---
  // Faculty
  const faculty = await prisma.faculty.upsert({
    where: { id: 'fac-001' },
    update: {},
    create: {
      id: 'fac-001',
      name: 'Faculty of Science',
      deanName: 'Dr. Alice Smith',
      contactInfo: 'science@university.edu',
    },
  });

  // Departments
  const departments = await Promise.all([
    prisma.department.upsert({
      where: { id: 'dep-001' },
      update: {},
      create: {
        id: 'dep-001',
        name: 'Department of Computer Science',
        facultyId: faculty.id,
      },
    }),
    prisma.department.upsert({
      where: { id: 'dep-002' },
      update: {},
      create: {
        id: 'dep-002',
        name: 'Department of Mathematics',
        facultyId: faculty.id,
      },
    }),
    prisma.department.upsert({
      where: { id: 'dep-003' },
      update: {},
      create: {
        id: 'dep-003',
        name: 'Department of Physics',
        facultyId: faculty.id,
      },
    })
  ]);

  // DegreePrograms
  const degreePrograms = await Promise.all([
    prisma.degreeProgram.upsert({
      where: { id: 'prog-001' },
      update: {},
      create: {
        id: 'prog-001',
        name: 'BSc Computer Science',
        duration: 4,
        facultyId: faculty.id,
        departmentId: departments[0].id,
      },
    }),
    prisma.degreeProgram.upsert({
      where: { id: 'prog-002' },
      update: {},
      create: {
        id: 'prog-002',
        name: 'BSc Mathematics',
        duration: 3,
        facultyId: faculty.id,
        departmentId: departments[1].id,
      },
    }),
    prisma.degreeProgram.upsert({
      where: { id: 'prog-003' },
      update: {},
      create: {
        id: 'prog-003',
        name: 'BSc Physics',
        duration: 3,
        facultyId: faculty.id,
        departmentId: departments[2].id,
      },
    })
  ]);

  // Batches
  await Promise.all([
    prisma.batch.upsert({
      where: { id: 'batch-001' },
      update: {},
      create: {
        id: 'batch-001',
        name: '2025 Intake',
        programId: degreePrograms[0].id,
        startYear: 2025,
      },
    }),
    prisma.batch.upsert({
      where: { id: 'batch-002' },
      update: {},
      create: {
        id: 'batch-002',
        name: '2026 Intake',
        programId: degreePrograms[0].id,
        startYear: 2026,
      },
    }),
    prisma.batch.upsert({
      where: { id: 'batch-003' },
      update: {},
      create: {
        id: 'batch-003',
        name: '2025 Math Intake',
        programId: degreePrograms[1].id,
        startYear: 2025,
      },
    }),
    prisma.batch.upsert({
      where: { id: 'batch-004' },
      update: {},
      create: {
        id: 'batch-004',
        name: '2025 Physics Intake',
        programId: degreePrograms[2].id,
        startYear: 2025,
      },
    })
  ]);
  const password = await bcrypt.hash('superadmin123', 12); // Change password as needed
  const email = 'superadmin@yourdomain.com'; // Change email as needed

  // Check if super admin already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Super admin already exists.');
    return;
  }

  await prisma.user.create({
    data: {
      username: 'superadmin',
      email,
      password,
      role: 'super_admin',
      isActive: true,
      firstName: 'Super',
      lastName: 'Admin',
    },
  });
  console.log('Super admin created!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
