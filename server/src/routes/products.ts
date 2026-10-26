import { Router } from 'express'
import type { Prisma } from '../generated/prisma/client.js'
import { HttpError } from '../lib/http-error.js'
import { prisma } from '../lib/prisma.js'
import { productInclude, productOrder, toProductJson } from '../lib/product-json.js'

export const productsRouter = Router()

// GET /api/products?category=<slug>&featured=true
productsRouter.get('/', async (req, res) => {
  const { category, featured } = req.query
  const where: Prisma.ProductWhereInput = {}

  if (typeof category === 'string' && category) {
    where.category = { slug: category }
  }
  if (featured !== undefined) {
    if (featured !== 'true' && featured !== 'false') {
      throw new HttpError(400, 'INVALID_QUERY', 'featured must be "true" or "false".')
    }
    where.featured = featured === 'true'
  }

  const products = await prisma.product.findMany({ where, include: productInclude, orderBy: productOrder })
  res.json(products.map(toProductJson))
})

// GET /api/products/:slug
productsRouter.get('/:slug', async (req, res) => {
  const product = await prisma.product.findUnique({ where: { slug: req.params.slug }, include: productInclude })
  if (!product) {
    throw new HttpError(404, 'PRODUCT_NOT_FOUND', 'No product matches that slug.')
  }
  res.json(toProductJson(product))
})
