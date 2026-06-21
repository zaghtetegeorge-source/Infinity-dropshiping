import { PrismaClient } from "@prisma/client";
import { seedDatabase } from "../src/lib/seedDatabase";

const prisma = new PrismaClient();

seedDatabase(prisma)
  .then(({ adminEmail, adminPassword, productCount, categoryCount }) => {
    console.log(`Seeded ${productCount} demo products across ${categoryCount} categories.`);
    console.log(`Admin login: ${adminEmail} / ${adminPassword} (change this password after first login).`);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
