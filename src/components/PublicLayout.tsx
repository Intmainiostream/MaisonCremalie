import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

// Chrome around the public pages; <Outlet /> is where the matched page renders, like @yield('content') in Blade.
function PublicLayout() {
  return (
    <div className="app">
      <div className="bg-blobs" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Navbar />
      <main id="main" className="main">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default PublicLayout
