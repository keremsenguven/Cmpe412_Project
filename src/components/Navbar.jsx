import { NavLink } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import './Navbar.css'

export default function Navbar() {
  const { criticalProducts, shoppingList } = useApp()

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">🍽️</span>
        <span className="brand-name">Recipe Engine</span>
      </div>
      <div className="navbar-links">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <span className="nav-icon">📊</span>
          <span>Dashboard</span>
          {criticalProducts.length > 0 && (
            <span className="badge badge-red">{criticalProducts.length}</span>
          )}
        </NavLink>
        <NavLink to="/pantry" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <span className="nav-icon">🧺</span>
          <span>Pantry</span>
        </NavLink>
        <NavLink to="/recipes" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <span className="nav-icon">👨‍🍳</span>
          <span>Recipes</span>
        </NavLink>
        <NavLink to="/shopping" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <span className="nav-icon">🛒</span>
          <span>Shopping</span>
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
