// Seeds categories, the starter products and a dev admin account.
// Safe to re-run: existing rows (matched by slug/email) are left unchanged.
// Run with: npm run db:seed
import { hashPassword } from '../src/lib/password.js'
import { prisma } from '../src/lib/prisma.js'

const CATEGORIES = [
  { name: 'Macarons', slug: 'macarons', sortOrder: 1 },
  { name: 'Cream Puffs', slug: 'cream-puffs', sortOrder: 2 },
]

// Same names, descriptions and prices as src/data/products.ts in the client.
const PRODUCTS = [
  { slug: 'fraise-chantilly', name: 'Fraise Chantilly', category: 'macarons', price: 85, featured: true, description: 'Sweet strawberry shells hugging a cloud of fluffy whipped cream.' },
  { slug: 'rose-poudree', name: 'Rose Poudrée', category: 'macarons', price: 90, featured: false, description: 'A soft, powdery rose bite that tastes like a spring garden.' },
  { slug: 'petale-de-lune', name: 'Pétale de Lune', category: 'macarons', price: 80, featured: false, description: 'Creamy vanilla filling, gentle and glowing like moonlight.' },
  { slug: 'framboise-reveuse', name: 'Framboise Rêveuse', category: 'macarons', price: 90, featured: true, description: 'Dreamy raspberry ganache with a little tangy surprise.' },
  { slug: 'lavande-douce', name: 'Lavande Douce', category: 'macarons', price: 95, featured: false, description: 'Calming lavender and honey, like a cozy afternoon nap.' },
  { slug: 'litchi-soleil', name: 'Litchi Soleil', category: 'macarons', price: 95, featured: false, description: 'Juicy lychee filling that brings a burst of sunshine.' },
  { slug: 'chou-nuage', name: 'Chou Nuage', category: 'cream-puffs', price: 120, featured: true, description: 'A light-as-air puff filled with classic vanilla cream.' },
  { slug: 'petit-chou-rose', name: 'Petit Chou Rose', category: 'cream-puffs', price: 130, featured: false, description: 'A tiny pink puff with rose cream and a sugar-dusted top.' },
  { slug: 'chou-fraise-eternelle', name: 'Chou Fraise Éternelle', category: 'cream-puffs', price: 145, featured: true, description: 'Fresh strawberries and swirls of cream, sweet forever.' },
  { slug: 'chou-vanille-etoilee', name: 'Chou Vanille Étoilée', category: 'cream-puffs', price: 135, featured: false, description: 'Starry vanilla bean custard under a crisp, sugary crown.' },
]

// DEV ONLY: placeholder login for local testing. Never created in production.
const DEV_ADMIN = { email: 'admin@maisoncremalie.local', password: 'changeme123' }

async function main(): Promise<void> {
  const categoryIds = new Map<string, number>()
  for (const category of CATEGORIES) {
    const row = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    })
    categoryIds.set(category.slug, row.id)
  }

  for (const { category, ...product } of PRODUCTS) {
    const categoryId = categoryIds.get(category)
    if (categoryId === undefined) throw new Error(`Unknown category: ${category}`)
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: { ...product, categoryId },
    })
  }
  console.log(`Seeded ${CATEGORIES.length} categories and ${PRODUCTS.length} products.`)

  if (process.env['NODE_ENV'] === 'production') {
    console.log('Production: skipped dev admin account.')
    return
  }
  await prisma.adminUser.upsert({
    where: { email: DEV_ADMIN.email },
    update: {},
    create: { email: DEV_ADMIN.email, passwordHash: await hashPassword(DEV_ADMIN.password) },
  })
  console.log(`Dev admin: ${DEV_ADMIN.email} / ${DEV_ADMIN.password}`)
}

main()
  .catch((err: unknown) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
