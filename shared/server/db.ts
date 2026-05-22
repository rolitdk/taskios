import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  /** Сбрасывает кэш клиента в dev после `prisma generate` / миграций. */
  prismaKey?: string;
};

/** Обновляйте после изменений схемы Prisma, чтобы dev не держал старый клиент. */
const PRISMA_CLIENT_KEY = "task-sort-order";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const db =
  globalForPrisma.prismaKey === PRISMA_CLIENT_KEY && globalForPrisma.prisma
    ? globalForPrisma.prisma
    : createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
  globalForPrisma.prismaKey = PRISMA_CLIENT_KEY;
}
