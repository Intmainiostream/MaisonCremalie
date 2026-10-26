// Creates an admin account, or resets the password if the email already exists.
// Run from the server folder: npm run admin:create
import { createInterface } from 'node:readline/promises'
import { hashPassword, MIN_PASSWORD_LENGTH } from '../lib/password.js'
import { prisma } from '../lib/prisma.js'

// Reads a line without echoing it (falls back to plain lines when input is piped in).
function askHidden(question: string, pipedLines: string[] | null): Promise<string> {
  process.stdout.write(question)
  if (pipedLines) {
    process.stdout.write('\n')
    return Promise.resolve(pipedLines.shift() ?? '')
  }
  return new Promise((resolve, reject) => {
    const { stdin } = process
    let value = ''
    const onData = (chunk: string) => {
      for (const char of chunk) {
        if (char === '\r' || char === '\n') {
          done()
          process.stdout.write('\n')
          resolve(value)
          return
        }
        if (char === '\u0003') {
          done()
          reject(new Error('Cancelled.'))
          return
        }
        if (char === '\u007f' || char === '\b') value = value.slice(0, -1)
        else value += char
      }
    }
    const done = () => {
      stdin.off('data', onData)
      stdin.setRawMode(false)
      stdin.pause()
    }
    stdin.setRawMode(true)
    stdin.setEncoding('utf8')
    stdin.resume()
    stdin.on('data', onData)
  })
}

async function readPipedLines(): Promise<string[]> {
  let text = ''
  for await (const chunk of process.stdin) text += String(chunk)
  return text.split(/\r?\n/)
}

async function main(): Promise<void> {
  const pipedLines = process.stdin.isTTY ? null : await readPipedLines()

  let email: string
  if (pipedLines) {
    email = (pipedLines.shift() ?? '').trim().toLowerCase()
  } else {
    const rl = createInterface({ input: process.stdin, output: process.stdout })
    email = (await rl.question('Admin email: ')).trim().toLowerCase()
    rl.close()
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('That does not look like an email address.')

  const password = await askHidden(`Password (at least ${MIN_PASSWORD_LENGTH} characters): `, pipedLines)
  if (password.length < MIN_PASSWORD_LENGTH) throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
  const confirm = await askHidden('Type it again: ', pipedLines)
  if (confirm !== password) throw new Error('The passwords do not match.')

  const existed = (await prisma.adminUser.count({ where: { email } })) > 0
  const passwordHash = await hashPassword(password)
  await prisma.adminUser.upsert({ where: { email }, update: { passwordHash }, create: { email, passwordHash } })
  console.log(existed ? `Password reset for ${email}.` : `Admin account created for ${email}.`)
}

main()
  .catch((err: unknown) => {
    console.error(err instanceof Error ? err.message : err)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
