import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import PublicLayout from './components/PublicLayout'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'
import Shop from './pages/Shop'

// The admin area is loaded only when someone opens /admin, so shoppers never download it.
const AdminApp = lazy(() => import('./admin/AdminApp'))

function App() {
  return (
    <>
      <ScrollToTop />
      {/* Like routes/web.php, but matched in the browser without a page reload */}
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
        </Route>
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<p className="admin-boot">Loading…</p>}>
              <AdminApp />
            </Suspense>
          }
        />
      </Routes>
    </>
  )
}

export default App
