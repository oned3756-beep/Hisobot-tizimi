import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  const objects = [
    { nameUz: "Kanatka yo'li", nameRu: "Канатная дорога", slug: "kanatka" },
    { nameUz: "Osma ko'prik", nameRu: "Подвесной мост", slug: "osma-korpik" },
    { nameUz: "Transfer xizmati", nameRu: "Трансфер", slug: "transfer" },
    { nameUz: "Mehmonhona", nameRu: "Гостиница", slug: "mehmonhona" },
    { nameUz: "Xojatxona", nameRu: "Туалет", slug: "xojatxona" },
    { nameUz: "Parkovka", nameRu: "Парковка", slug: "parkovka" },
  ];

  for (const obj of objects) {
    const created = await prisma.businessObject.upsert({
      where: { slug: obj.slug },
      update: {},
      create: obj,
    });

    const staffPasswordHash = await bcrypt.hash("staff123", 10);
    await prisma.user.upsert({
      where: { username: obj.slug },
      update: {},
      create: {
        username: obj.slug,
        passwordHash: staffPasswordHash,
        role: "STAFF",
        objectId: created.id,
      },
    });
  }

  const cashierPasswordHash = await bcrypt.hash("kassir123", 10);
  await prisma.user.upsert({
    where: { username: "kassir" },
    update: {},
    create: {
      username: "kassir",
      passwordHash: cashierPasswordHash,
      role: "CASHIER",
    },
  });

  console.log("Seed complete.");
  console.log("Admin login: admin / admin123");
  console.log("Cashier login: kassir / kassir123");
  console.log(
    "Staff logins: " +
      objects.map((o) => `${o.slug}/staff123`).join(", "),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
