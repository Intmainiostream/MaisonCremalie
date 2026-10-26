import { useState, type FormEvent } from 'react'
import { useApi } from '../../hooks/useApi'
import { apiRequest, ApiError } from '../../lib/api'
import type { Category } from '../../types/product'
import AdminError from '../components/AdminError'
import Field from '../components/Field'
import Modal from '../components/Modal'
import { PlusIcon, TrashIcon } from '../components/icons'
import { errorMessage, fieldErrors } from '../errors'

interface CategoryRowProps {
  category: Category
  onSaved: () => void
  onDelete: (category: Category) => void
}

function CategoryRow({ category, onSaved, onDelete }: CategoryRowProps) {
  const [name, setName] = useState(category.name)
  const [slug, setSlug] = useState(category.slug)
  const [sortOrder, setSortOrder] = useState(String(category.sortOrder))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const dirty = name !== category.name || slug !== category.slug || sortOrder !== String(category.sortOrder)

  async function save() {
    setSaving(true)
    setErrors({})
    try {
      await apiRequest('PATCH', `/api/admin/categories/${category.id}`, { name, slug, sortOrder })
      onSaved()
    } catch (err) {
      const fields = fieldErrors(err)
      setErrors(Object.keys(fields).length ? fields : { name: errorMessage(err) })
      setSaving(false)
    }
  }

  const error = errors['name'] ?? errors['slug'] ?? errors['sortOrder']
  return (
    <tr>
      <td>
        <label className="visually-hidden" htmlFor={`cat-name-${category.id}`}>
          Name
        </label>
        <input id={`cat-name-${category.id}`} value={name} onChange={(e) => setName(e.target.value)} />
        {error && <p className="admin-field-error">{error}</p>}
      </td>
      <td>
        <label className="visually-hidden" htmlFor={`cat-slug-${category.id}`}>
          Slug
        </label>
        <input id={`cat-slug-${category.id}`} value={slug} onChange={(e) => setSlug(e.target.value)} />
      </td>
      <td>
        <label className="visually-hidden" htmlFor={`cat-sort-${category.id}`}>
          Sort order
        </label>
        <input
          id={`cat-sort-${category.id}`}
          className="admin-input-narrow"
          type="number"
          min="0"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        />
      </td>
      <td className="admin-nowrap">{category.productCount}</td>
      <td>
        <div className="admin-row-actions">
          <button type="button" className="admin-btn admin-btn--small admin-btn--primary" onClick={save} disabled={!dirty || saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--small admin-btn--danger"
            onClick={() => onDelete(category)}
            aria-label={`Delete ${category.name}`}
          >
            <TrashIcon />
          </button>
        </div>
      </td>
    </tr>
  )
}

function CategoriesPage() {
  const categories = useApi<Category[]>('/api/admin/categories')
  const [newName, setNewName] = useState('')
  const [newSlug, setNewSlug] = useState('')
  const [addErrors, setAddErrors] = useState<Record<string, string>>({})
  const [adding, setAdding] = useState(false)
  const [message, setMessage] = useState('')
  const [toDelete, setToDelete] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [deleted, setDeleted] = useState<string | null>(null)

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAdding(true)
    setAddErrors({})
    setMessage('')
    try {
      const created = await apiRequest<Category>('POST', '/api/admin/categories', { name: newName, slug: newSlug })
      setNewName('')
      setNewSlug('')
      setMessage(`${created.name} was added.`)
      categories.retry()
    } catch (err) {
      const fields = fieldErrors(err)
      setAddErrors(Object.keys(fields).length ? fields : { name: errorMessage(err) })
    } finally {
      setAdding(false)
    }
  }

  async function confirmDelete() {
    if (!toDelete) return
    setDeleting(true)
    try {
      await apiRequest('DELETE', `/api/admin/categories/${toDelete.id}`)
      setDeleted(toDelete.name)
      setToDelete(null)
      categories.retry()
    } catch (err) {
      // 409: the category still has products; show the server's friendly explanation in the modal
      setDeleteError(err instanceof ApiError ? err.message : errorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  function closeDelete() {
    setToDelete(null)
    setDeleteError('')
  }

  return (
    <>
      <header className="admin-page-head">
        <div>
          <h1>Categories</h1>
          <p>The shop's filter chips follow this list and its sort order.</p>
        </div>
      </header>

      <form className="admin-card admin-inline-form" onSubmit={handleAdd} noValidate>
        <Field id="new-category-name" label="New category name" error={addErrors['name']}>
          <input id="new-category-name" value={newName} onChange={(e) => setNewName(e.target.value)} maxLength={40} />
        </Field>
        <Field id="new-category-slug" label="Slug (optional)" error={addErrors['slug']}>
          <input id="new-category-slug" value={newSlug} onChange={(e) => setNewSlug(e.target.value)} placeholder="made from the name" />
        </Field>
        <button type="submit" className="admin-btn admin-btn--primary" disabled={adding}>
          <PlusIcon /> {adding ? 'Adding…' : 'Add category'}
        </button>
      </form>

      {message && (
        <p className="admin-alert admin-alert--success" role="status">
          {message}
        </p>
      )}

      {categories.error ? (
        <AdminError message={categories.error} onRetry={categories.retry} />
      ) : !categories.data ? (
        <div className="admin-card admin-skeleton-list" role="status" aria-label="Loading categories">
          <span className="admin-skeleton-row" />
          <span className="admin-skeleton-row" />
        </div>
      ) : (
        <div className="admin-card admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Slug</th>
                <th scope="col">Order</th>
                <th scope="col">Products</th>
                <th scope="col">
                  <span className="visually-hidden">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {categories.data.map((category) => (
                // The key includes the saved values, so a row resets to fresh state after each save
                <CategoryRow
                  key={`${category.id}:${category.name}:${category.slug}:${category.sortOrder}`}
                  category={category}
                  onSaved={categories.retry}
                  onDelete={setToDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={toDelete !== null}
        title={deleteError ? "This category can't be deleted yet" : 'Delete this category?'}
        tone="danger"
        onClose={closeDelete}
        actions={
          deleteError ? (
            <button type="button" className="admin-btn admin-btn--primary" onClick={closeDelete}>
              OK
            </button>
          ) : (
            <>
              <button type="button" className="admin-btn" onClick={closeDelete} disabled={deleting}>
                Keep it
              </button>
              <button type="button" className="admin-btn admin-btn--danger" onClick={confirmDelete} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Yes, delete'}
              </button>
            </>
          )
        }
      >
        <p>{deleteError || <><strong>{toDelete?.name}</strong> will be removed from the shop's filters.</>}</p>
      </Modal>

      <Modal
        open={deleted !== null}
        title="Category deleted"
        tone="success"
        onClose={() => setDeleted(null)}
        actions={
          <button type="button" className="admin-btn admin-btn--primary" onClick={() => setDeleted(null)}>
            OK
          </button>
        }
      >
        <p>
          <strong>{deleted}</strong> is gone.
        </p>
      </Modal>
    </>
  )
}

export default CategoriesPage
