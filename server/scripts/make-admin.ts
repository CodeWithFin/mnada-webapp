import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error('Please provide an email address');
    console.log('Usage: tsx scripts/make-admin.ts user@example.com');
    process.exit(1);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.error(`User with email ${email} not found`);
      process.exit(1);
    }

    if (user.isAdmin) {
      console.log(`User ${email} is already an admin`);
      process.exit(0);
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { isAdmin: true },
      select: {
        email: true,
        username: true,
        isAdmin: true
      }
    });

    console.log('✅ User is now an admin!');
    console.log(updatedUser);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });

