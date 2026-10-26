import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import ProductIllustration from '../../components/ProductIllustration'
import { useApi } from '../../hooks/useApi'
import { apiRequest, ApiError } from '../../lib/api'
import { slugify } from '../../lib/slug'
import { productTint } from '../../lib/tints'
import type { Category, Product } from '../../types/product'
import AdminError from '../components/AdminError'
import Field from '../components/Field'
import LoadingScreen from '../components/LoadingScreen'
import Switch from '../components/Switch'
import { UploadIcon } from '../components/icons'
import { errorMessage, fieldErrors } from '../errors'

const MAX_IMAGE_BYTES = 2 * 1024 * 1024

interface FormValues {
  name: string
  slug: string
  categoryId: string
  description: string
  price: string
  imageUrl: string | null
  featured: boolean
  available: boolean
}

function toValues(product?: Product): FormValues {
  return {
    name: product?.name ?? '',
    slug: product?.slug ?? '',
    categoryId: product ? String(product.category.id) : '',
    description: product?.description ?? '',
    price: product ? String(product.price) : '',
    imageUrl: product?.imageUrl ?? null,
    featured: product?.featured ?? false,
    available: product?.available ?? true,
  }
}

// Loads the product first when editing, then shows the form
function ProductFormPage({ id }: { id?: number }) {
  if (id === undefined) return <ProductForm />
  return <EditProduct id={id} />
}

function EditProduct({ id }: { id: number }) {
  const { data, error, retry } = useApi<Product>(`/api/admin/products/${id}`)
  if (error) {
    return (
      <>
        <Link to="/admin/products" className="admin-back">
          ← All products
        </Link>
        <AdminError message={error} onRetry={retry} />
      </>
    )
  }
  if (!data) return <LoadingScreen label="Loading product…" />
  return <ProductForm product={data} />
}

function ProductForm({ product }: { product?: Product }) {
  const navigate = useNavigate()
  const location = useLocation()
  const categories = useApi<Category[]>('/api/admin/categories')

  const [values, setValues] = useState(() => toValues(product))
  // Editing keeps the saved slug; a new product follows the name until the slug is typed by hand
  const [slugEdited, setSlugEdited] = useState(Boolean(product))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [success, setSuccess] = useState(() => (location.state as { flash?: string } | null)?.flash ?? '')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }))
    setErrors((e) => ({ ...e, [key]: '' }))
    setSuccess('')
  }

  function handleName(name: string) {
    update('name', name)
    if (!slugEdited) setValues((v) => ({ ...v, slug: slugify(name) }))
  }

  async function handleImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (file.size > MAX_IMAGE_BYTES) {
      setErrors((e) => ({ ...e, imageUrl: 'Images must be 2 MB or smaller.' }))
      return
    }
    setUploading(true)
    const form = new FormData()
    form.append('image', file)
    try {
      const { url } = await apiRequest<{ url: string }>('POST', '/api/admin/uploads', form)
      update('imageUrl', url)
    } catch (err) {
      setErrors((e) => ({ ...e, imageUrl: errorMessage(err) }))
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setFormError('')
    setSuccess('')
    const body = { ...values, categoryId: values.categoryId ? Number(values.categoryId) : null }
    try {
      if (product) {
        const saved = await apiRequest<Product>('PATCH', `/api/admin/products/${product.id}`, body)
        setValues(toValues(saved))
        setSuccess('Changes saved! The shop shows them on the next page load.')
      } else {
        const created = await apiRequest<Product>('POST', '/api/admin/products', body)
        navigate(`/admin/products/${created.id}`, { replace: true, state: { flash: `${created.name} was added to the shop!` } })
      }
    } catch (err) {
      setErrors(fieldErrors(err))
      setFormError(err instanceof ApiError && err.fields ? 'Please fix the fields marked below.' : errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const describedBy = (key: string) => (errors[key] ? `product-${key}-error` : undefined)
  const categorySlug = categories.data?.find((c) => String(c.id) === values.categoryId)?.slug ?? ''

  return (
    <>
      <Link to="/admin/products" className="admin-back">
        ← All products
      </Link>
      <header className="admin-page-head">
        <div>
          <h1>{product ? `Edit ${product.name}` : 'Add a product'}</h1>
          <p>{product ? 'Update the details and save.' : 'Fill in the details for a new sweet.'}</p>
        </div>
      </header>

      {success && (
        <p className="admin-alert admin-alert--success" role="status">
          {success}
        </p>
      )}
      {formError && <AdminError message={formError} />}

      <form className="admin-form-grid" onSubmit={handleSubmit} noValidate>
        <div className="admin-card admin-form">
          <Field id="product-name" label="Name" error={errors['name']}>
            <input
              id="product-name"
              value={values.name}
              onChange={(e) => handleName(e.target.value)}
              aria-invalid={Boolean(errors['name'])}
              aria-describedby={describedBy('name')}
              maxLength={80}
              required
            />
          </Field>
          <Field
            id="product-slug"
            label="Slug"
            error={errors['slug']}
            hint="Used in links. Leave empty to make one from the name."
          >
            <input
              id="product-slug"
              value={values.slug}
              onChange={(e) => {
                setSlugEdited(true)
                update('slug', e.target.value)
              }}
              onBlur={() => update('slug', slugify(values.slug))}
              aria-invalid={Boolean(errors['slug'])}
              aria-describedby={describedBy('slug')}
            />
          </Field>
          <div className="admin-form-row">
            <Field id="product-category" label="Category" error={errors['categoryId']}>
              <select
                id="product-category"
                value={values.categoryId}
                onChange={(e) => update('categoryId', e.target.value)}
                aria-invalid={Boolean(errors['categoryId'])}
                aria-describedby={describedBy('categoryId')}
                disabled={!categories.data}
              >
                <option value="">{categories.data ? 'Choose a category' : 'Loading…'}</option>
                {(categories.data ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="product-price" label="Price (PHP)" error={errors['price']}>
              <input
                id="product-price"
                type="number"
                inputMode="decimal"
                min="0.01"
                step="0.01"
                value={values.price}
                onChange={(e) => update('price', e.target.value)}
                aria-invalid={Boolean(errors['price'])}
                aria-describedby={describedBy('price')}
              />
            </Field>
          </div>
          <Field id="product-description" label="Description" error={errors['description']}>
            <textarea
              id="product-description"
              rows={4}
              maxLength={500}
              value={values.description}
              onChange={(e) => update('description', e.target.value)}
              aria-invalid={Boolean(errors['description'])}
              aria-describedby={describedBy('description')}
            />
          </Field>
          <div className="admin-switches">
            <Switch checked={values.featured} onChange={(v) => update('featured', v)} label="Featured on the home page" />
            <Switch checked={values.available} onChange={(v) => update('available', v)} label="Available (off = sold out)" />
          </div>
        </div>

        <div className="admin-card admin-form">
          <p className="admin-label">Photo</p>
          <div className="admin-image-preview">
            {values.imageUrl ? (
              <img src={values.imageUrl} alt={`Preview of ${values.name || 'the product'}`} />
            ) : (
              <ProductIllustration categorySlug={categorySlug} color={productTint(values.slug)} />
            )}
          </div>
          <div className="admin-image-actions">
            <label className={`admin-btn ${uploading ? 'is-disabled' : ''}`}>
              <UploadIcon /> {uploading ? 'Uploading…' : values.imageUrl ? 'Replace photo' : 'Upload photo'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="visually-hidden"
                onChange={handleImage}
                disabled={uploading}
              />
            </label>
            {values.imageUrl && (
              <button type="button" className="admin-btn admin-btn--danger" onClick={() => update('imageUrl', null)}>
                Remove
              </button>
            )}
          </div>
          {errors['imageUrl'] ? (
            <p className="admin-field-error" role="alert">
              {errors['imageUrl']}
            </p>
          ) : (
            <p className="admin-field-hint">JPG, PNG or WebP, up to 2 MB. Saved when you save the product.</p>
          )}
        </div>

        <div className="admin-form-footer">
          <Link to="/admin/products" className="admin-btn">
            Cancel
          </Link>
          <button type="submit" className="admin-btn admin-btn--primary" disabled={saving || uploading}>
            {saving ? 'Saving…' : product ? 'Save changes' : 'Add product'}
          </button>
        </div>
      </form>
    </>
  )
}

export default ProductFormPage
