import { Router } from 'express'
import { requireAdmin } from '../../middleware/require-admin.js'
import { adminCategoriesRouter } from './categories.js'
import { adminProductsRouter } from './products.js'
import { adminUploadsRouter } from './uploads.js'

// Every route below needs a logged-in admin, like Route::middleware('auth')->group(...)
export const adminRouter = Router()

adminRouter.use(requireAdmin)
adminRouter.use('/products', adminProductsRouter)
adminRouter.use('/categories', adminCategoriesRouter)
adminRouter.use('/uploads', adminUploadsRouter)
