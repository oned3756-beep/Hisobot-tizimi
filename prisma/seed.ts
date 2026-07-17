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
    { nameUz: "Jumping", nameRu: "Джампинг", slug: "jumping" },
    { nameUz: "Arqondan sakrash", nameRu: "Роупджампинг", slug: "arqondan-sakrash" },
    { nameUz: "Bolalar maydonchasi", nameRu: "Детская площадка", slug: "bolalar-maydonchasi" },
    { nameUz: "Kvadrosikl", nameRu: "Квадроцикл", slug: "kvadrosikl" },
    { nameUz: "Havo shari", nameRu: "Воздушный шар", slug: "havo-shari" },
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

  const organization = await prisma.organization.upsert({
    where: { slug: "abc-tour" },
    update: {},
    create: {
      nameUz: "ABC Tour",
      nameRu: "ABC Тур",
      slug: "abc-tour",
      commissionPercent: 20,
    },
  });

  const cashierPasswordHash = await bcrypt.hash("kassir123", 10);
  await prisma.user.upsert({
    where: { username: "abc-tour" },
    update: {},
    create: {
      username: "abc-tour",
      passwordHash: cashierPasswordHash,
      role: "CASHIER",
      organizationId: organization.id,
    },
  });

  console.log("Seed complete.");
  console.log("Admin login: admin / admin123");
  console.log("Cashier login (ABC Tour, 20% komissiya): abc-tour / kassir123");
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
