import { createHash } from 'node:crypto'
import type { CookieOptions, Request, Response } from 'express'
import { env } from '../config/env.js'
import { createToken } from './token.js'

export const SESSION_COOKIE = 'mc_session'
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60

// httpOnly: page JavaScript can't read the cookie, the browser just sends it back (like Laravel's session cookie).
const cookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: env.NODE_ENV === 'production',
  path: '/',
}

export function passwordVersion(passwordHash: string): string {
  return createHash('sha256').update(passwordHash).digest('base64url').slice(0, 16)
}

export function setSessionCookie(res: Response, admin: { id: number; passwordHash: string }): void {
  const token = createToken(admin.id, passwordVersion(admin.passwordHash), SESSION_TTL_SECONDS)
  res.cookie(SESSION_COOKIE, token, { ...cookieOptions, maxAge: SESSION_TTL_SECONDS * 1000 })
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE, cookieOptions)
}

// Reads the session cookie from the raw header (avoids adding cookie-parser).
export function readSessionCookie(req: Request): string | null {
  const header = req.headers.cookie
  if (!header) return null
  for (const part of header.split(';')) {
    const [name, ...rest] = part.trim().split('=')
    if (name === SESSION_COOKIE) return decodeURIComponent(rest.join('='))
  }
  return null
}
