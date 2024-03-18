import {createClient} from '@libsql/client'
import {Ratelimit} from '@upstash/ratelimit'
import {Redis} from '@upstash/redis'
import {drizzle} from 'drizzle-orm/libsql'

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_DATABASE_AUTH_TOKEN,
})
export const db = drizzle(client)
export const rateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(1, '10 s'),
  analytics: true,
})
