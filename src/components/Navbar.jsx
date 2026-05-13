import { NavLink } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import './Navbar.css'

export default function Navbar() {
  const { criticalProducts, shoppingList } = useApp()

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">🍽️</span>
        <span className="brand-name">Tarif Motoru</span>
      </div>
      <div className="navbar-links">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <span className="nav-icon">📊</span>
          <span>Anasayfa</span>
          {criticalProducts.length > 0 && (
            <span className="badge badge-red">{criticalProducts.length}</span>
          )}
        </NavLink>
        <NavLink to="/pantry" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <span className="nav-icon">🧺</span>
          <span>Dolap</span>
        </NavLink>
        <NavLink to="/recipes" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <span className="nav-icon">👨‍🍳</span>
          <span>Tarifler</span>
        </NavLink>
        <NavLink to="/shopping" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <span className="nav-icon">🛒</span>
          <span>Alışveriş</span>
          {shoppingList.filter(i => !i.checked).length > 0 && (
            <span className="badge badge-green">
              {shoppingList.filter(i => !i.checked).length}
            </span>
          )}
        </NavLink>
      </div>
    </nav>
  )
}
