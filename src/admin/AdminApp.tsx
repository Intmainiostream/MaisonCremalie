import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import AdminAuthProvider from './auth/AdminAuthProvider'
import RequireAdmin from './auth/RequireAdmin'
import AdminLayout from './components/AdminLayout'
import LoginPage from './pages/LoginPage'
import ProductsPage from './pages/ProductsPage'
import ProductFormPage from './pages/ProductFormPage'
import CategoriesPage from './pages/CategoriesPage'
import SettingsPage from './pages/SettingsPage'
import './admin.css'

// A fresh form for every product id, so state from one product never leaks into another
function ProductFormRoute() {
  const { id } = useParams()
  return <ProductFormPage key={id ?? 'new'} id={id ? Number(id) : undefined} />
}

function AdminApp() {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route path="login" element={<LoginPage />} />
        <Route
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<Navigate to="products" replace />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/new" element={<ProductFormRoute />} />
          <Route path="products/:id" element={<ProductFormRoute />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="products" replace />} />
        </Route>
      </Routes>
    </AdminAuthProvider>
  )
}

export default AdminApp
