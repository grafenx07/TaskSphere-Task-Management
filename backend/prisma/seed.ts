import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create sample users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.upsert({
    where: { email: 'admin@tasksphere.com' },
    update: {},
    create: {
      email: 'admin@tasksphere.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'user@tasksphere.com' },
    update: {},
    create: {
      email: 'user@tasksphere.com',
      password: hashedPassword,
      name: 'Regular User',
      role: 'USER',
    },
  });

  // Create sample tasks
  await prisma.task.createMany({
    data: [
      {
        title: 'Complete project setup',
        description: 'Set up the initial project structure and configuration',
        status: 'COMPLETED',
        priority: 1,
        userId: user1.id,
      },
      {
        title: 'Design database schema',
        description: 'Create Prisma schema with all necessary models',
        status: 'COMPLETED',
        priority: 1,
        userId: user1.id,
      },
      {
        title: 'Implement authentication',
        description: 'Add JWT-based authentication system',
        status: 'IN_PROGRESS',
        priority: 2,
        userId: user1.id,
      },
      {
        title: 'Create API endpoints',
        description: 'Build RESTful API for task management',
        status: 'TODO',
        priority: 2,
        userId: user2.id,
      },
      {
        title: 'Write tests',
        description: 'Add unit and integration tests',
        status: 'TODO',
        priority: 3,
        userId: user2.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Database seeded successfully!');
  console.log(`Created users: ${user1.email}, ${user2.email}`);
  console.log('Created 5 sample tasks');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
