import { PrismaClient } from "@prisma/client"

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient({ datasourceUrl: process.env.DATABASE_URL })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export async function main() {
  const data = await prisma.todo.create({
    data: {
      id: Date.now(),
      name: new Date().toISOString(),
    },
  })

  return {
    ...data,
  }
}
