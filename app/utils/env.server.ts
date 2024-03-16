import {z} from 'zod'

const envVariables = z.object({
  NODE_ENV: z.enum(['production', 'development', 'test'] as const),

  // Resend
  RESEND_API_KEY: z.string().trim().min(1),
  RESEND_ADDRESS_SENDER: z.string().trim().min(1),
  RESEND_ADDRESS_RECEIVER: z.string().trim().min(1),

  // Turso
  TURSO_DATABASE_URL: z.string().url(),
  TURSO_DATABASE_AUTH_TOKEN: z.string().optional(),

  // Upstash
  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().trim().min(1),
})

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envVariables> {}
  }
}

export function init() {
  const parsed = envVariables.safeParse(process.env)

  if (parsed.success === false) {
    const {fieldErrors} = parsed.error.flatten()
    const errorMessage = Object.entries(fieldErrors)
      .map(([field, errors]) =>
        errors ? `${field}: ${errors.join(', ')}` : field,
      )
      .join('\n  ')
    console.error('❌ Invalid environment variables:', fieldErrors)
    throw new Error(`Invalid envirmonment variables:\n ${errorMessage}`)
  }
}

/**
 * This is used in both `entry.server.ts` and `root.tsx` to ensure that
 * the environment variables are set and globally available before the app is
 * started.
 *
 * NOTE: Do *not* add any environment variables in here that you do not wish to
 * be included in the client.
 * @returns all public ENV variables
 */
export function getEnv() {
  return {
    NODE_ENV: process.env.NODE_ENV,
  }
}

type ENV = ReturnType<typeof getEnv>

declare global {
  // eslint-disable-next-line no-var
  var ENV: ENV
  interface Window {
    ENV: ENV
  }
}
