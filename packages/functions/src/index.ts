import { PrismaClient } from "@prisma/client"

export async function main() {
  try {
    const globalForPrisma = global as unknown as { prisma: PrismaClient }
    const prisma = globalForPrisma.prisma || new PrismaClient({ datasourceUrl: process.env.DATABASE_URL })
    if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
    const data = await prisma.todo.create({
      data: {
        name: new Date().toISOString(),
      },
    })
    return data
  } catch (error: any) {
    return {
      error: error,
      message: error.message
    }
  }
}
