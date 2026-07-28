import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL ortam değişkeni tanımlı değil.");
  }

  // Bu veritabanı GateHub ile paylaşılıyor. `schema` seçeneği olmadan sorgular
  // `public` schema'sına, yani GateHub'ın tablolarının yanına gider.
  // Bağlantı dizesine `?schema=` yazmak işe yaramaz — onu yalnızca Prisma CLI
  // anlar, çalışma zamanındaki node-postgres anlamaz.
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }, { schema: "testmetrix" }),
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
