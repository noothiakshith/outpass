import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  console.log('🌱 Starting database seeding...');
  const passwordHash = await hash('password123', 10); // Hashing passwords with bcrypt

  // Create HOD
  const hod = await prisma.user.create({
    data: {
      email: 'hod@example.com',
      password: passwordHash,
      role: 'HOD',
      name: 'Dr. John Smith',
      department: 'Computer Science',
      hodProfile: {
        create: {
          department: 'Computer Science',
        },
      },
    },
  });
  console.log('HOD Created:', {
    email: hod.email,
    password: 'password123',
    role: hod.role,
    name: hod.name,
    department: hod.department,
  });

  // Create Class Teacher
  const teacher = await prisma.user.create({
    data: {
      email: 'teacher@example.com',
      password: passwordHash,
      role: 'TEACHER',
      name: 'Ms. Jane Doe',
      department: 'Computer Science',
      teacherProfile: {
        create: {
          department: 'Computer Science',
        },
      },
    },
  });
  console.log('Teacher Created:', {
    email: teacher.email,
    password: 'password123',
    role: teacher.role,
    name: teacher.name,
    department: teacher.department,
  });

  // Create Security
  const security = await prisma.user.create({
    data: {
      email: 'security@example.com',
      password: passwordHash,
      role: 'ADMIN',
      name: 'Security Officer',
      adminProfile: {
        create: {},
      },
    },
  });
  console.log('Security Created:', {
    email: security.email,
    password: 'password123',
    role: security.role,
    name: security.name,
  });

  // Create Student
  const student = await prisma.user.create({
    data: {
      email: 'student@example.com',
      password: passwordHash,
      role: 'STUDENT',
      name: 'Alice Johnson',
      rollNumber: 'CS2023001',
      branch: 'Computer Science',
      department: 'Computer Science',
      parentPhone: '1234567890',
      studentProfile: {
        create: {
          classTeacherId: teacher.teacherProfile?.id,
          hodId: hod.hodProfile?.id,
        },
      },
    },
  });
  console.log('Student Created:', {
    email: student.email,
    password: 'password123',
    role: student.role,
    name: student.name,
    rollNumber: student.rollNumber,
    branch: student.branch,
    department: student.department,
    parentPhone: student.parentPhone,
  });

  // Add student email to allowedStudentEmail
  const allowedEmail = await prisma.allowedStudentEmail.create({
    data: {
      email: 'student@example.com',
    },
  });
  console.log('Allowed Student Email Created:', {
    email: allowedEmail.email,
  });

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });