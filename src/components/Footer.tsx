import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import Drip from './Drip'
import './Footer.css'

function Footer() {
  const [joined, setJoined] = useState(false)

  // No backend yet: the form is handled in the browser instead of posting to a controller
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    event.currentTarget.reset()
    setJoined(true)
  }

  return (
    <footer className="footer">
      <Drip variant="scallop" color="var(--color-pink)" />
      <div className="footer-inner">
        <div className="container footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              Maison Crémalie
            </Link>
            <p>Whipped with love, one swirl at a time.</p>
          </div>

          <nav aria-label="Footer">
            <h2 className="footer-heading">Visit</h2>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/shop">All sweets</Link></li>
              <li><Link to="/shop?category=macarons">Macarons</Link></li>
              <li><Link to="/shop?category=cream-puffs">Cream puffs</Link></li>
            </ul>
          </nav>

          <div>
            <h2 className="footer-heading">The sweet letter</h2>
            <p>New flavors and little treats, once a month.</p>
            <form className="newsletter" onSubmit={handleSubmit}>
              <label htmlFor="newsletter-email" className="visually-hidden">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                placeholder="you@email.com"
                autoComplete="email"
                required
              />
              <button type="submit" className="btn btn-primary">
                Join
              </button>
            </form>
            <p className="newsletter-status" aria-live="polite">
              {joined ? "Merci! You're on the sweet list." : ''}
            </p>
          </div>
        </div>

        <div className="container footer-bottom">
          <p>© {new Date().getFullYear()} Maison Crémalie</p>
          <p>Made with cream, strawberries and code.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
