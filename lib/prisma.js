import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

let prisma

if (process.env.DATABASE_URL) {
  prisma = globalForPrisma.prisma || new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
  
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
  }
} else {
  console.error('DATABASE_URL is not set in environment variables')
  prisma = null
}

export { prisma }

