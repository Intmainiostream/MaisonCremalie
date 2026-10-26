import { Router } from 'express'
import { prisma } from '../lib/prisma.js'

export const categoriesRouter = Router()

// GET /api/categories
categoriesRouter.get('/', async (_req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { products: true } } },
  })

  res.json(
    categories.map(({ _count, ...category }) => ({ ...category, productCount: _count.products })),
  )
})
