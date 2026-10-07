import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@presscontacts.com";
  const adminPassword = "admin123";

  const existing = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existing) {
    console.log("Admin user already exists");
    return;
  }

  const hash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.create({
    data: {
      name: "PressContacts Admin",
      email: adminEmail,
      passwordHash: hash,
      role: "SUPER_ADMIN",
      status: "APPROVED",
      pressCardUrl: "/uploads/admin-seed.jpg",
    },
  });

  console.log("Admin user created successfully!");
  console.log(`Email: ${adminEmail}`);
  console.log(`Password: ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });