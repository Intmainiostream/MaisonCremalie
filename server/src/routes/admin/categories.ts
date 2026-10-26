import { Router } from 'express'
import { isForeignKeyViolation, isUniqueViolation } from '../../lib/db-errors.js'
import { HttpError, validationError, type FieldErrors } from '../../lib/http-error.js'
import { prisma } from '../../lib/prisma.js'
import { asRecord, parseId, slugify, trimmed } from '../../lib/validate.js'

export const adminCategoriesRouter = Router()

type CategoryData = { name?: string; slug?: string; sortOrder?: number }

async function parseCategory(body: unknown, existing?: { id: number; name: string }): Promise<CategoryData> {
  const input = asRecord(body)
  const creating = !existing
  const data: CategoryData = {}
  const fields: FieldErrors = {}
  const notThis = existing ? { id: { not: existing.id } } : {}

  if (creating || 'name' in input) {
    const name = trimmed(input['name'])
    if (!name) fields['name'] = 'Please give the category a name.'
    else if (name.length > 40) fields['name'] = 'Keep the name under 40 characters.'
    else if (await prisma.category.findFirst({ where: { name: { equals: name, mode: 'insensitive' }, ...notThis } })) {
      fields['name'] = 'A category with this name already exists.'
    } else data.name = name
  }

  if (creating || 'slug' in input) {
    const slug = slugify(trimmed(input['slug']) || data.name || existing?.name || '')
    if (!slug) {
      if (!fields['name']) fields['slug'] = 'Use at least one letter or number.'
    } else if (await prisma.category.findFirst({ where: { slug, ...notThis } })) {
      fields['slug'] = 'Another category already uses this slug.'
    } else data.slug = slug
  }

  if ('sortOrder' in input && input['sortOrder'] !== '' && input['sortOrder'] !== null) {
    const sortOrder = Number(input['sortOrder'])
    if (!Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 9999) {
      fields['sortOrder'] = 'Use a whole number from 0 to 9999.'
    } else data.sortOrder = sortOrder
  }

  if (Object.keys(fields).length > 0) throw validationError(fields)
  return data
}

async function findCategory(idParam: string | undefined) {
  const category = await prisma.category.findUnique({
    where: { id: parseId(idParam, 'Category') },
    include: { _count: { select: { products: true } } },
  })
  if (!category) throw new HttpError(404, 'NOT_FOUND', 'Category not found.')
  return category
}

function duplicateError(): HttpError {
  return validationError({ name: 'This name or slug is already used by another category.' })
}

// GET /api/admin/categories
adminCategoriesRouter.get('/', async (_req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    include: { _count: { select: { products: true } } },
  })
  res.json(categories.map(({ _count, ...category }) => ({ ...category, productCount: _count.products })))
})

// POST /api/admin/categories
adminCategoriesRouter.post('/', async (req, res) => {
  const data = await parseCategory(req.body)
  // New categories go to the end unless a sort order was given
  const last = await prisma.category.aggregate({ _max: { sortOrder: true } })
  try {
    const category = await prisma.category.create({
      data: { name: data.name ?? '', slug: data.slug ?? '', sortOrder: data.sortOrder ?? (last._max.sortOrder ?? 0) + 1 },
    })
    res.status(201).json({ ...category, productCount: 0 })
  } catch (err) {
    if (isUniqueViolation(err)) throw duplicateError()
    throw err
  }
})

// PATCH /api/admin/categories/:id
adminCategoriesRouter.patch('/:id', async (req, res) => {
  const existing = await findCategory(req.params.id)
  const data = await parseCategory(req.body, existing)
  try {
    const category = await prisma.category.update({ where: { id: existing.id }, data })
    res.json({ ...category, productCount: existing._count.products })
  } catch (err) {
    if (isUniqueViolation(err)) throw duplicateError()
    throw err
  }
})

// DELETE /api/admin/categories/:id
adminCategoriesRouter.delete('/:id', async (req, res) => {
  const existing = await findCategory(req.params.id)
  const count = existing._count.products
  const inUse = new HttpError(
    409,
    'CATEGORY_HAS_PRODUCTS',
    `"${existing.name}" still has ${count} ${count === 1 ? 'product' : 'products'}. Move them to another category or delete them first.`,
  )
  if (count > 0) throw inUse

  try {
    await prisma.category.delete({ where: { id: existing.id } })
  } catch (err) {
    // A product was added in the meantime: the database's RESTRICT rule caught it
    if (isForeignKeyViolation(err)) throw inUse
    throw err
  }
  res.status(204).end()
})
