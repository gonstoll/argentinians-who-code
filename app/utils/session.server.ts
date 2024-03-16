import {createCookieSessionStorage} from '@remix-run/node'

export type SessionData = {
  userId: string
}

export type SessionFlashData = {
  error: string
}

export const {getSession, commitSession, destroySession} =
  createCookieSessionStorage<SessionData, SessionFlashData>({
    cookie: {
      name: '__session',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secrets: [process.env.SESSION_SECRET],
    },
  })
