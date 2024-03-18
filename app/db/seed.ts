import {createClient} from '@libsql/client'
import bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'
import {drizzle} from 'drizzle-orm/libsql'
import {devs, users} from './schema'

dotenv.config()

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_DATABASE_AUTH_TOKEN,
})
const db = drizzle(client)

async function dbTeardown() {
  console.log('🔥 Dropping tables...')
  await db.delete(devs).all()
  await db.delete(users).all()
  console.log('✅ Tables dropped')
}

async function seedAdmin() {
  const ADMIN = {
    email: process.env.ADMIN_EMAIL || '',
    password: process.env.ADMIN_PASSWORD || '',
  }
  if (!ADMIN.email || !ADMIN.password) {
    console.log(
      '❌ ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required',
    )
    return
  }
  const passwordHash = await bcrypt.hash(ADMIN.password, 10)
  console.log('🌱 Seeding admin...')
  await db.insert(users).values({...ADMIN, password: passwordHash})
  console.log('✅ Admin seeded')
}

async function seedDevs() {
  console.log('🌱 Seeding devs...')
  await db.insert(devs).values([
    {
      name: 'Gonzalo Stoll',
      from: 'Córdoba',
      expertise: 'frontend',
      link: 'https://gonzalostoll.com',
    },
    // Generate 20 more devs with random data
    ...Array.from({length: 20}, (_, i) => ({
      name: `Dev ${i}`,
      from: 'Córdoba' as const,
      expertise: 'frontend' as const,
      link: `https://dev${i}.com`,
    })),
  ])
  console.log('✅ Devs seeded')
}

async function seed() {
  await dbTeardown()
  await seedAdmin()
  await seedDevs()
}

seed()
