import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const connectionString = process.env.DATABASE_URL ?? "";
const isNeon = connectionString.includes("neon.tech");

// Neon (production): serverless WebSocket driver — tez va serverless muhitida
// ulanishlar tugab qolmaydi. Local dev: oddiy pg (mahalliy Postgres).
function createAdapter() {
  if (isNeon) {
    neonConfig.webSocketConstructor = ws;
    return new PrismaNeon({ connectionString });
  }
  return new PrismaPg({ connectionString });
}

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter: createAdapter() });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
