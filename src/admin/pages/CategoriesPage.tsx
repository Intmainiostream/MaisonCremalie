import { useState, type FormEvent } from 'react'
import { useApi } from '../../hooks/useApi'
import { apiRequest } from '../../lib/api'
import type { Category } from '../../types/product'
import AdminError from '../components/AdminError'
import Field from '../components/Field'
import Modal from '../components/Modal'
import { PlusIcon, TrashIcon } from '../components/icons'
import { errorMessage, fieldErrors } from '../errors'
import { useFeedback } from '../feedback/useFeedback'

// Field errors stay under the inputs; the popup gives the first one so the admin knows what to fix
function firstMessage(fields: Record<string, string>, err: unknown): string {
  return Object.values(fields)[0] ?? errorMessage(err)
}

interface CategoryRowProps {
  category: Category
  onSaved: () => void
  onDelete: (category: Category) => void
}

function CategoryRow({ category, onSaved, onDelete }: CategoryRowProps) {
  const feedback = useFeedback()
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
      const saved = await apiRequest<Category>('PATCH', `/api/admin/categories/${category.id}`, { name, slug, sortOrder })
      feedback.success('Saved!', `${saved.name} was updated.`)
      onSaved()
    } catch (err) {
      const fields = fieldErrors(err)
      setErrors(fields)
      feedback.error("Couldn't save the category", firstMessage(fields, err))
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
  const feedback = useFeedback()
  const [newName, setNewName] = useState('')
  const [newSlug, setNewSlug] = useState('')
  const [addErrors, setAddErrors] = useState<Record<string, string>>({})
  const [adding, setAdding] = useState(false)
  const [toDelete, setToDelete] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAdding(true)
    setAddErrors({})
    try {
      const created = await apiRequest<Category>('POST', '/api/admin/categories', { name: newName, slug: newSlug })
      setNewName('')
      setNewSlug('')
      categories.retry()
      feedback.success('Saved!', `${created.name} was added.`)
    } catch (err) {
      const fields = fieldErrors(err)
      setAddErrors(fields)
      feedback.error("Couldn't add the category", firstMessage(fields, err))
    } finally {
      setAdding(false)
    }
  }

  async function confirmDelete() {
    if (!toDelete) return
    setDeleting(true)
    try {
      await apiRequest('DELETE', `/api/admin/categories/${toDelete.id}`)
      categories.retry()
      feedback.success('Deleted', `${toDelete.name} was removed.`)
    } catch (err) {
      // 409 when it still has products: the server's message explains what to do
      feedback.error("This category can't be deleted yet", errorMessage(err))
    } finally {
      setToDelete(null)
      setDeleting(false)
    }
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
        title="Delete this category?"
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
          <strong>{toDelete?.name}</strong> will be removed from the shop's filters.
        </p>
      </Modal>
    </>
  )
}

export default CategoriesPage
