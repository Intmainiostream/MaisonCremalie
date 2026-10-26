import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Route changes don't load a new page, so the scroll position has to be reset by hand
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  return null
}

export default ScrollToTop
