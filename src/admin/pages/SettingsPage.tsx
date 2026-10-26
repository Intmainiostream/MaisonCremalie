import { useState, type FormEvent } from 'react'
import { apiRequest } from '../../lib/api'
import { useAdminAuth } from '../auth/useAdminAuth'
import AdminError from '../components/AdminError'
import Field from '../components/Field'
import PasswordInput from '../components/PasswordInput'
import { errorMessage, fieldErrors } from '../errors'

const MIN_LENGTH = 8

function SettingsPage() {
  const { admin } = useAdminAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError('')
    setSuccess('')
    const found: Record<string, string> = {}
    if (!currentPassword) found['currentPassword'] = 'Please enter your current password.'
    if (newPassword.length < MIN_LENGTH) found['newPassword'] = `Use at least ${MIN_LENGTH} characters.`
    if (confirm !== newPassword) found['confirm'] = "The new passwords don't match."
    setErrors(found)
    if (Object.keys(found).length) return

    setSaving(true)
    try {
      await apiRequest('POST', '/api/auth/change-password', { currentPassword, newPassword })
      setCurrentPassword('')
      setNewPassword('')
      setConfirm('')
      setSuccess('Password changed! Other devices will need to log in again.')
    } catch (err) {
      const fields = fieldErrors(err)
      setErrors(fields)
      if (!Object.keys(fields).length) setFormError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const describedBy = (key: string) => (errors[key] ? `settings-${key}-error` : undefined)

  return (
    <>
      <header className="admin-page-head">
        <div>
          <h1>Settings</h1>
          <p>Logged in as {admin?.email}</p>
        </div>
      </header>

      <form className="admin-card admin-form admin-form--narrow" onSubmit={handleSubmit} noValidate>
        <h2 className="admin-card-title">Change password</h2>
        {success && (
          <p className="admin-alert admin-alert--success" role="status">
            {success}
          </p>
        )}
        {formError && <AdminError message={formError} />}

        <Field id="settings-currentPassword" label="Current password" error={errors['currentPassword']}>
          <PasswordInput
            id="settings-currentPassword"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            aria-invalid={Boolean(errors['currentPassword'])}
            aria-describedby={describedBy('currentPassword')}
          />
        </Field>
        <Field id="settings-newPassword" label="New password" error={errors['newPassword']} hint={`At least ${MIN_LENGTH} characters.`}>
          <PasswordInput
            id="settings-newPassword"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            aria-invalid={Boolean(errors['newPassword'])}
            aria-describedby={describedBy('newPassword')}
          />
        </Field>
        <Field id="settings-confirm" label="Confirm new password" error={errors['confirm']}>
          <PasswordInput
            id="settings-confirm"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            aria-invalid={Boolean(errors['confirm'])}
            aria-describedby={describedBy('confirm')}
          />
        </Field>

        <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
          {saving ? 'Saving…' : 'Change password'}
        </button>
      </form>
    </>
  )
}

export default SettingsPage
