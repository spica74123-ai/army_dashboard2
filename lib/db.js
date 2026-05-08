import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

async function connectDB() {
  // Prisma handles connection pool automatically.
  // We use this function to ensure default data exists.
  await initDefaultAdmin();
  return prisma;
}

async function initDefaultAdmin() {
  try {
    const adminCount = await prisma.user.count({
      where: { username: 'admin' }
    });

    if (adminCount === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('123', salt);
      
      await prisma.user.create({
        data: {
          username: 'admin',
          password: hashedPassword,
          name: 'System Admin',
          role: 'Admin'
        }
      });
      console.log("✅ Default admin user created (admin/123)");
    }
  } catch (error) {
    // If migration hasn't run yet, this will fail gracefully
    // console.log("Note: Could not init default admin (DB might not be ready yet)");
  }
}

export default connectDB;
export { prisma };
