import type { Prisma } from '../generated/prisma/client.js'

export const productInclude = {
  category: { select: { id: true, name: true, slug: true } },
} satisfies Prisma.ProductInclude

type ProductWithCategory = Prisma.ProductGetPayload<{ include: typeof productInclude }>

// Shapes a row for JSON, like a Laravel API Resource. Decimal becomes a plain number.
export function toProductJson(product: ProductWithCategory) {
  return {
    ...product,
    price: product.price.toNumber(),
    imageUrl: product.imageUrl ?? undefined,
  }
}

export const productOrder = [
  { category: { sortOrder: 'asc' } },
  { name: 'asc' },
] satisfies Prisma.ProductOrderByWithRelationInput[]
