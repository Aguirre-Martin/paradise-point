const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const readline = require('readline')

const prisma = new PrismaClient()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query) {
  return new Promise(resolve => rl.question(query, resolve))
}

async function createSuperAdmin() {
  try {
    console.log('🔐 Creación de Super Admin\n')

    const email = await question('Email del admin: ')
    const name = await question('Nombre: ')
    const password = await question('Contraseña: ')

    if (!email || !name || !password) {
      console.log('❌ Todos los campos son obligatorios')
      process.exit(1)
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      const update = await question(`⚠️  Usuario con email ${email} ya existe. ¿Actualizar a admin? (s/n): `)
      
      if (update.toLowerCase() === 's') {
        await prisma.user.update({
          where: { email },
          data: { role: 'admin' }
        })
        console.log('✅ Usuario actualizado a admin!')
      } else {
        console.log('❌ Cancelado')
      }
      rl.close()
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'admin'
      }
    })

    console.log('\n✅ Super Admin creado exitosamente!')
    console.log(`📧 Email: ${admin.email}`)
    console.log(`👤 Nombre: ${admin.name}`)
    console.log(`🔑 Rol: ${admin.role}`)
    console.log('\n🚀 Ya podés iniciar sesión en /login\n')

  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    rl.close()
    await prisma.$disconnect()
  }
}

createSuperAdmin()

