import { PrismaPg } from '@prisma/adapter-pg'
import { env } from '../config/env.js'
import { PrismaClient } from '../generated/prisma/client.js'

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL })

// One shared client for the whole process (Prisma's version of Eloquent's DB connection).
export const prisma = new PrismaClient({ adapter })
