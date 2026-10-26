import { Link, NavLink } from 'react-router-dom'
import Heart from './illustrations/Heart'
import './Navbar.css'

function Navbar() {
  return (
    <header className="navbar">
      <nav className="navbar-pill" aria-label="Main">
        <Link to="/" className="navbar-logo">
          <Heart />
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
