import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@ecosphere.com' },
    update: {},
    create: {
      email: 'admin@ecosphere.com',
      password: hashedPassword,
      role: 'ADMIN',
      firstName: 'Super',
      lastName: 'Admin',
    },
  })
  
  const hrDepartment = await prisma.department.upsert({
    where: { name: 'Human Resources' },
    update: {},
    create: { name: 'Human Resources' }
  })
  
  const itDepartment = await prisma.department.upsert({
    where: { name: 'Information Technology' },
    update: {},
    create: { name: 'Information Technology' }
  })
  
  await prisma.emissionFactor.upsert({
    where: { source: 'Electricity (Grid)' },
    update: {},
    create: {
      source: 'Electricity (Grid)',
      unit: 'kWh',
      co2Equivalent: 0.233
    }
  })

  console.log('Seed data inserted.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
