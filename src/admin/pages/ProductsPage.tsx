import { useState } from 'react'
import { Link } from 'react-router-dom'
import ProductIllustration from '../../components/ProductIllustration'
import { useApi } from '../../hooks/useApi'
import { apiRequest } from '../../lib/api'
import { formatPrice } from '../../lib/format'
import { productTint } from '../../lib/tints'
import type { Category, Product } from '../../types/product'
import AdminError from '../components/AdminError'
import Modal from '../components/Modal'
import Switch from '../components/Switch'
import { PlusIcon, TrashIcon } from '../components/icons'
import { errorMessage } from '../errors'
import { useFeedback } from '../feedback/useFeedback'

type Flag = 'featured' | 'available'

function toggleMessage(name: string, flag: Flag, on: boolean): string {
  if (flag === 'featured') return on ? `${name} is now featured.` : `${name} is no longer featured.`
  return on ? `${name} is available again.` : `${name} is marked as sold out.`
}

function ProductsPage() {
  const products = useApi<Product[]>('/api/admin/products')
  const categories = useApi<Category[]>('/api/admin/categories')
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('all')
  const feedback = useFeedback()
  const [pending, setPending] = useState<string | null>(null)
  const [toDelete, setToDelete] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState(false)

  const query = search.trim().toLowerCase()
  const visible = (products.data ?? []).filter(
    (p) =>
      (categoryId === 'all' || String(p.category.id) === categoryId) &&
      (!query || p.name.toLowerCase().includes(query) || p.slug.includes(query)),
  )

  async function toggle(product: Product, flag: Flag) {
    setPending(`${product.id}-${flag}`)
    try {
      await apiRequest('PATCH', `/api/admin/products/${product.id}`, { [flag]: !product[flag] })
      products.retry()
      feedback.success('Saved!', toggleMessage(product.name, flag, !product[flag]))
    } catch (err) {
      feedback.error("Couldn't save", errorMessage(err))
    } finally {
      setPending(null)
    }
  }

  async function confirmDelete() {
    if (!toDelete) return
    setDeleting(true)
    try {
      await apiRequest('DELETE', `/api/admin/products/${toDelete.id}`)
      setToDelete(null)
      products.retry()
      feedback.success('Deleted', `${toDelete.name} was removed from the shop.`)
    } catch (err) {
      setToDelete(null)
      feedback.error("Couldn't delete", errorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  function renderBody() {
    if (products.error) return <AdminError message={products.error} onRetry={products.retry} />
    if (!products.data) {
      return (
        <div className="admin-card admin-skeleton-list" role="status" aria-label="Loading products">
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i} className="admin-skeleton-row" />
          ))}
        </div>
      )
    }
    if (visible.length === 0) {
      return <p className="admin-card admin-empty">No products match your search.</p>
    }
    return (
      <div className="admin-card admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th scope="col">Product</th>
              <th scope="col">Category</th>
              <th scope="col">Price</th>
              <th scope="col">Featured</th>
              <th scope="col">Available</th>
              <th scope="col">
                <span className="visually-hidden">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((product) => (
              <tr key={product.id}>
                <td>
                  <div className="admin-product-cell">
                    <span className="admin-thumb">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt="" />
                      ) : (
                        <ProductIllustration categorySlug={product.category.slug} color={productTint(product.slug)} />
                      )}
                    </span>
                    <span>
                      <Link to={`/admin/products/${product.id}`} className="admin-product-name">
                        {product.name}
                      </Link>
                      <span className="admin-badges">
                        {product.featured && <span className="admin-badge admin-badge--featured">Featured</span>}
                        {!product.available && <span className="admin-badge admin-badge--soldout">Sold out</span>}
                      </span>
                    </span>
                  </div>
                </td>
                <td>{product.category.name}</td>
                <td className="admin-nowrap">{formatPrice(product.price)}</td>
                <td>
                  <Switch
                    checked={product.featured}
                    onChange={() => toggle(product, 'featured')}
                    label={`Featured: ${product.name}`}
                    showLabel={false}
                    disabled={pending !== null}
                  />
                </td>
                <td>
                  <Switch
                    checked={product.available}
                    onChange={() => toggle(product, 'available')}
                    label={`Available: ${product.name}`}
                    showLabel={false}
                    disabled={pending !== null}
                  />
                </td>
                <td>
                  <div className="admin-row-actions">
                    <Link to={`/admin/products/${product.id}`} className="admin-btn admin-btn--small">
                      Edit
                    </Link>
                    <button
                      type="button"
                      className="admin-btn admin-btn--small admin-btn--danger"
                      onClick={() => setToDelete(product)}
                      aria-label={`Delete ${product.name}`}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <>
      <header className="admin-page-head">
        <div>
          <h1>Products</h1>
          <p>{products.data ? `${products.data.length} sweets in the shop` : 'Loading your sweets…'}</p>
        </div>
        <Link to="/admin/products/new" className="admin-btn admin-btn--primary">
          <PlusIcon /> Add product
        </Link>
      </header>

      <div className="admin-toolbar">
        <label className="visually-hidden" htmlFor="product-search">
          Search products
        </label>
        <input
          id="product-search"
          type="search"
          placeholder="Search by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <label className="visually-hidden" htmlFor="product-category">
          Filter by category
        </label>
        <select id="product-category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="all">All categories</option>
          {(categories.data ?? []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {renderBody()}

      <Modal
        open={toDelete !== null}
        title="Delete this product?"
        tone="danger"
        onClose={() => !deleting && setToDelete(null)}
        actions={
          <>
            <button type="button" className="admin-btn" onClick={() => setToDelete(null)} disabled={deleting}>
              Keep it
            </button>
            <button type="button" className="admin-btn admin-btn--danger" onClick={confirmDelete} disabled={deleting}>
              {deleting ? 'Deleting…' : 'Yes, delete'}
            </button>
          </>
        }
      >
        <p>
          <strong>{toDelete?.name}</strong> will be removed from the shop, along with its photo. This can't be undone.
        </p>
      </Modal>
    </>
  )
}

export default ProductsPage
