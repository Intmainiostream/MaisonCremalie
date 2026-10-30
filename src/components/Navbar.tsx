import { Link, NavLink } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
  return (
    <header className="navbar">
      <nav className="navbar-pill" aria-label="Main">
        <Link to="/" className="navbar-logo">
          <img
            src="/brand/logo-icon-160.png"
            alt="Cream puff mascot logo"
            className="navbar-logo-icon"
            width="36"
            height="36"
          />
          Maison Crémalie
        </Link>
        <ul className="navbar-links">
          <li>
            <NavLink to="/" end>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/shop">Shop</NavLink>
          </li>
        </ul>
      </nav>
    </header>
  )
}

export default Navbar
