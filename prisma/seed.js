const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10)

  await prisma.user.upsert({
    where: { email: 'admin@paradisepoint.com' },
    update: {},
    create: {
      email: 'admin@paradisepoint.com',
      name: 'Admin',
      password: hashedPassword,
      role: 'admin'
    }
  })

  const occupiedStart = new Date('2026-03-27')
  const occupiedEnd = new Date('2026-04-01')
  for (let d = new Date(occupiedStart); d <= occupiedEnd; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0]
    await prisma.day.upsert({
      where: { date: dateStr },
      update: { status: 'reserved' },
      create: { date: dateStr, status: 'reserved' }
    })
  }
  console.log('Marked 2026-03-27 to 2026-04-01 as reserved')

  console.log('Seed completed: admin user created, occupied dates set')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
