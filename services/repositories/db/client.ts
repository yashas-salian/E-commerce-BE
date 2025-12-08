import { PrismaClient } from "./generated/prisma/client.js"
import { PrismaPg } from "@prisma/adapter-pg"

export * from "./generated/prisma/client.js"

// Export factory function for services to create their own instance
export function createPrismaClient(databaseUrl: string) {
  const adapter = new PrismaPg({
    connectionString: databaseUrl
  })
  
  return new PrismaClient({ adapter })
}

// Optional: Export singleton with global caching
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient(process.env.DATABASE_URL!)

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}