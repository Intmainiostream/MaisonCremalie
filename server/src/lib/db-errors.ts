import { Prisma } from '../generated/prisma/client.js'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

// The Postgres error code behind a Prisma error. With the pg driver adapter it sits in meta.driverAdapterError.cause.
function postgresCode(error: unknown): string | undefined {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return undefined
  const adapterError = error.meta?.['driverAdapterError']
  if (!isRecord(adapterError) || !isRecord(adapterError['cause'])) return undefined
  const code = adapterError['cause']['code']
  return typeof code === 'string' ? code : undefined
}

function hasPrismaCode(error: unknown, code: string): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === code
}

export function isUniqueViolation(error: unknown): boolean {
  return hasPrismaCode(error, 'P2002') || postgresCode(error) === '23505'
}

export function isForeignKeyViolation(error: unknown): boolean {
  return hasPrismaCode(error, 'P2003') || postgresCode(error) === '23001' || postgresCode(error) === '23503'
}
