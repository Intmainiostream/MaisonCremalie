import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../auth/useAdminAuth'
import { BoxIcon, GearIcon, LogOutIcon, StoreIcon, TagIcon } from './icons'

function AdminLayout() {
  const { admin, logout } = useAdminAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="admin">
      <aside className="admin-sidebar">
        <Link to="/admin/products" className="admin-brand">
          <span className="admin-brand-badge">Admin</span>
          <span className="admin-brand-name">
            <img
              src="/brand/logo-icon-160.png"
              alt="Cream puff mascot logo"
              className="admin-brand-icon"
              width="30"
              height="30"
            />
            Maison Crémalie
          </span>
        </Link>
        <nav className="admin-nav" aria-label="Admin">
          <NavLink to="/admin/products">
            <BoxIcon /> Products
          </NavLink>
          <NavLink to="/admin/categories">
            <TagIcon /> Categories
          </NavLink>
          <NavLink to="/admin/settings">
            <GearIcon /> Settings
          </NavLink>
          <a href="/" target="_blank" rel="noreferrer">
            <StoreIcon /> View shop
          </a>
          <button type="button" onClick={handleLogout}>
            <LogOutIcon /> Log out
          </button>
        </nav>
        <p className="admin-user">{admin?.email}</p>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
