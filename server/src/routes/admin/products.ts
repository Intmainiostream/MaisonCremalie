import { Router } from 'express'
import type { Prisma } from '../../generated/prisma/client.js'
import { isUniqueViolation } from '../../lib/db-errors.js'
import { HttpError, validationError, type FieldErrors } from '../../lib/http-error.js'
import { prisma } from '../../lib/prisma.js'
import { productInclude, productOrder, toProductJson } from '../../lib/product-json.js'
import { deleteUpload, isUploadUrl } from '../../lib/uploads.js'
import { asRecord, parseId, slugify, trimmed } from '../../lib/validate.js'

export const adminProductsRouter = Router()

type ProductData = Prisma.ProductUncheckedUpdateInput & {
  name?: string
  slug?: string
  imageUrl?: string | null
}

const SLUG_TAKEN = 'Another product already uses this slug.'

// Like a Laravel FormRequest. Creating checks every field; updating only checks the fields sent.
async function parseProduct(body: unknown, existing?: { id: number; name: string }): Promise<ProductData> {
  const input = asRecord(body)
  const creating = !existing
  const has = (key: string) => creating || key in input
  const data: ProductData = {}
  const fields: FieldErrors = {}

  if (has('name')) {
    const name = trimmed(input['name'])
    if (!name) fields['name'] = 'Please give the product a name.'
    else if (name.length > 80) fields['name'] = 'Keep the name under 80 characters.'
    else data.name = name
  }

  if (has('slug')) {
    const slug = slugify(trimmed(input['slug']) || data.name || existing?.name || '')
    if (slug) data.slug = slug
    else if (!fields['name']) fields['slug'] = 'Use at least one letter or number.'
  }

  if (has('description')) {
    const description = trimmed(input['description'])
    if (description.length > 500) fields['description'] = 'Keep the description under 500 characters.'
    else data.description = description
  }

  if (has('price')) {
    const raw = input['price']
    const price = typeof raw === 'number' ? raw : typeof raw === 'string' && raw.trim() ? Number(raw) : NaN
    if (!Number.isFinite(price) || price <= 0) fields['price'] = 'Price must be a number greater than 0.'
    else if (price > 100_000) fields['price'] = 'That price looks too high.'
    else data.price = Math.round(price * 100) / 100
  }

  if (has('categoryId')) {
    const categoryId = Number(input['categoryId'])
    const exists = Number.isInteger(categoryId) && (await prisma.category.count({ where: { id: categoryId } })) > 0
    if (!exists) fields['categoryId'] = 'Please choose a category.'
    else data.categoryId = categoryId
  }

  if ('imageUrl' in input) {
    const imageUrl = input['imageUrl']
    if (imageUrl === null || imageUrl === '') data.imageUrl = null
    else if (typeof imageUrl === 'string' && isUploadUrl(imageUrl)) data.imageUrl = imageUrl
    else fields['imageUrl'] = 'Please upload the image again.'
  }

  for (const flag of ['featured', 'available'] as const) {
    if (!(flag in input)) continue
    if (typeof input[flag] === 'boolean') data[flag] = input[flag]
    else fields[flag] = 'Must be on or off.'
  }

  if (data.slug && !fields['slug']) {
    const taken = await prisma.product.findFirst({
      where: { slug: data.slug, ...(existing ? { id: { not: existing.id } } : {}) },
    })
    if (taken) fields['slug'] = SLUG_TAKEN
  }

  if (Object.keys(fields).length > 0) throw validationError(fields)
  return data
}

async function findProduct(idParam: string | undefined) {
  const product = await prisma.product.findUnique({ where: { id: parseId(idParam, 'Product') } })
  if (!product) throw new HttpError(404, 'NOT_FOUND', 'Product not found.')
  return product
}

// GET /api/admin/products
adminProductsRouter.get('/', async (_req, res) => {
  const products = await prisma.product.findMany({ include: productInclude, orderBy: productOrder })
  res.json(products.map(toProductJson))
})

// GET /api/admin/products/:id
adminProductsRouter.get('/:id', async (req, res) => {
  const { id } = await findProduct(req.params.id)
  const product = await prisma.product.findUniqueOrThrow({ where: { id }, include: productInclude })
  res.json(toProductJson(product))
})

// POST /api/admin/products
adminProductsRouter.post('/', async (req, res) => {
  const data = await parseProduct(req.body)
  try {
    // parseProduct guarantees the required fields when creating
    const product = await prisma.product.create({
      data: data as Prisma.ProductUncheckedCreateInput,
      include: productInclude,
    })
    res.status(201).json(toProductJson(product))
  } catch (err) {
    if (isUniqueViolation(err)) throw validationError({ slug: SLUG_TAKEN })
    throw err
  }
})

// PATCH /api/admin/products/:id
adminProductsRouter.patch('/:id', async (req, res) => {
  const existing = await findProduct(req.params.id)
  const data = await parseProduct(req.body, existing)
  try {
    const product = await prisma.product.update({ where: { id: existing.id }, data, include: productInclude })
    if ('imageUrl' in data && existing.imageUrl !== product.imageUrl) await deleteUpload(existing.imageUrl)
    res.json(toProductJson(product))
  } catch (err) {
    if (isUniqueViolation(err)) throw validationError({ slug: SLUG_TAKEN })
    throw err
  }
})

// DELETE /api/admin/products/:id
adminProductsRouter.delete('/:id', async (req, res) => {
  const existing = await findProduct(req.params.id)
  await prisma.product.delete({ where: { id: existing.id } })
  await deleteUpload(existing.imageUrl)
  res.status(204).end()
})
