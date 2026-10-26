import 'dotenv/config'

// Like Laravel's env(): values come from server/.env, loaded by dotenv above.
function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    console.error(`Missing environment variable ${name}. Copy server/.env.example to server/.env.`)
    process.exit(1)
  }
  return value
}

const JWT_SECRET = required('JWT_SECRET')
if (JWT_SECRET.length < 32) {
  console.error('JWT_SECRET must be at least 32 characters long.')
  process.exit(1)
}

export const env = {
  NODE_ENV: process.env['NODE_ENV'] ?? 'development',
  PORT: Number(process.env['PORT'] ?? 4000),
  DATABASE_URL: required('DATABASE_URL'),
  CLIENT_ORIGIN: process.env['CLIENT_ORIGIN'] ?? 'http://localhost:5173',
  JWT_SECRET,
}
