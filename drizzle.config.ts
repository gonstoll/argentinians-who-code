import type {Config} from 'drizzle-kit'
import * as dotenv from 'dotenv'

dotenv.config()

console.log('logging env (drizzle config): ', process.env)

export default {
  schema: './app/db/schema.ts',
  out: './drizzle/migrations',
  driver: 'turso',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_DATABASE_AUTH_TOKEN,
  },
} satisfies Config
