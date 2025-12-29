import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

let prisma

if (process.env.DATABASE_URL) {
  prisma = globalForPrisma.prisma || new PrismaClient()
  
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
  }
} else {
  prisma = null
}

export { prisma }

