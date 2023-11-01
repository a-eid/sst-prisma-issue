import { PrismaClient } from "@prisma/client"

export async function main() {
  try {
    const prisma = new PrismaClient({ datasourceUrl: process.env.DATABASE_URL })
    const data = await prisma.todo.create({ data: { name: new Date().toISOString() } })
    return data
  } catch (error: any) {
    console.log(error)
    return {
      error: error,
      message: error.message,
    }
  }
}
