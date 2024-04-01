import {faker} from '@faker-js/faker'
import {createClient} from '@libsql/client'
import bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'
import {drizzle} from 'drizzle-orm/libsql'
import {devs, expertises, nominees, provinces, users, type Dev} from './schema'

dotenv.config()

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_DATABASE_AUTH_TOKEN,
})
const db = drizzle(client)

function generateDev(): Omit<Dev, 'id'> {
  // Reason that is 200 characters long
  const reason = Array.from({length: 40})
    .map(() => faker.lorem.word({length: 4}))
    .join(' ')
  return {
    name: faker.person.fullName(),
    expertise: faker.helpers.arrayElement(expertises),
    from: faker.helpers.arrayElement(provinces),
    link: faker.internet.url(),
    createdAt: faker.date.recent().toISOString(),
    reason,
  }
}

async function dbTeardown() {
  console.log('🔥 Dropping tables...')
  await db.delete(devs).all()
  await db.delete(users).all()
  await db.delete(nominees).all()
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
  const fakeDevs = faker.helpers.multiple(generateDev, {count: 40})
  await db.insert(devs).values(fakeDevs)
  console.log('✅ Devs seeded')
}

async function seedNominees() {
  console.log('🌱 Seeding nominees...')
  const fakeNominees = faker.helpers.multiple(generateDev, {count: 10})
  await db.insert(nominees).values(fakeNominees)
  console.log('✅ Nominees seeded')
}

async function seed() {
  await dbTeardown()
  await seedAdmin()
  await seedNominees()
  await seedDevs()
}

seed()
