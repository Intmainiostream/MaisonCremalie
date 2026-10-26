import { createHmac, timingSafeEqual } from 'node:crypto'
import { env } from '../config/env.js'

// Minimal HS256 JWT so we don't need a JWT library.
// `pv` is a fingerprint of the admin's password hash: changing the password invalidates old tokens.
export type TokenPayload = { sub: number; pv: string; iat: number; exp: number }

const HEADER = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))

function base64url(input: string | Buffer): string {
  return Buffer.from(input).toString('base64url')
}

function sign(data: string): Buffer {
  return createHmac('sha256', env.JWT_SECRET).update(data).digest()
}

export function createToken(adminId: number, passwordVersion: string, ttlSeconds: number): string {
  const now = Math.floor(Date.now() / 1000)
  const payload: TokenPayload = { sub: adminId, pv: passwordVersion, iat: now, exp: now + ttlSeconds }
  const body = `${HEADER}.${base64url(JSON.stringify(payload))}`
  return `${body}.${sign(body).toString('base64url')}`
}

function isTokenPayload(value: unknown): value is TokenPayload {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v['sub'] === 'number' &&
    typeof v['pv'] === 'string' &&
    typeof v['iat'] === 'number' &&
    typeof v['exp'] === 'number'
  )
}

// Returns the payload, or null if the token is malformed, tampered with or expired.
export function verifyToken(token: string): TokenPayload | null {
  const [header, payload, signature] = token.split('.')
  if (header !== HEADER || !payload || !signature) return null

  const expected = sign(`${header}.${payload}`)
  const actual = Buffer.from(signature, 'base64url')
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null

  let decoded: unknown
  try {
    decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
  } catch {
    return null
  }
  if (!isTokenPayload(decoded)) return null
  if (decoded.exp <= Math.floor(Date.now() / 1000)) return null
  return decoded
}
