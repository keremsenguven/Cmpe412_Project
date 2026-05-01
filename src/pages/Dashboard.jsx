import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import ExpiryBadge from '../components/ExpiryBadge'
import './Dashboard.css'

export default function Dashboard() {
  const { products, criticalProducts, getDaysUntilExpiry, shoppingList } = useApp()
  const navigate = useNavigate()

  const totalProducts = products.length
  const expiredCount = products.filter(p => getDaysUntilExpiry(p) < 0).length

  return (
    <div className="page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p className="subtitle">Overview of your pantry</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">🧺</span>
          <div>
            <span className="stat-value">{totalProducts}</span>
            <span className="stat-label">Total Products</span>
          </div>
        </div>
        <div className="stat-card stat-warning">
          <span className="stat-icon">⚠️</span>
          <div>
            <span className="stat-value">{criticalProducts.length}</span>
            <span className="stat-label">Critical Items</span>
          </div>
        </div>
        <div className="stat-card stat-danger">
          <span className="stat-icon">🗑️</span>
          <div>
            <span className="stat-value">{expiredCount}</span>
            <span className="stat-label">Expired</span>
          </div>
        </div>
        <div className="stat-card stat-green">
          <span className="stat-icon">🛒</span>
          <div>
            <span className="stat-value">{shoppingList.filter(i => !i.checked).length}</span>
            <span className="stat-label">Shopping List</span>
          </div>
        </div>
      </div>

      {criticalProducts.length > 0 && (
        <div className="section">
          <div className="section-header">
            <h2>🚨 Critical Items</h2>
            <span className="section-sub">Expiring within 3 days</span>
          </div>
          <div className="critical-list">
            {criticalProducts.map(product => (
              <div
                key={product.id}
                className={`critical-item ${product.daysLeft <= 0 ? 'item-expired' : product.daysLeft <= 1 ? 'item-urgent' : 'item-warning'}`}
              >
                <div className="critical-item-info">
                  <span className="critical-item-name">{product.name}</span>
                  <span className="critical-item-qty">{product.quantity} {product.unit}</span>
                </div>
                <div className="critical-item-right">
                  <ExpiryBadge days={product.daysLeft} />
                  <span className="critical-item-date">
                    {product.predictedDays !== null
                      ? `AI prediction`
                      : new Date(product.expiryDate).toLocaleDateString('en-GB')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="quick-actions">
        <button className="quick-action-btn" onClick={() => navigate('/pantry')}>
          <span>🧺</span>
          <span>Manage Pantry</span>
        </button>
        <button className="quick-action-btn" onClick={() => navigate('/recipes')}>
          <span>👨‍🍳</span>
          <span>Suggest Recipes</span>
        </button>
        <button className="quick-action-btn" onClick={() => navigate('/shopping')}>
          <span>🛒</span>
          <span>Shopping List</span>
        </button>
      </div>

      {expiredCount === 0 && criticalProducts.length === 0 && (
        <div className="empty-state">
          <span>✅</span>
          <p>Great! No expired or critical items in your pantry.</p>
        </div>
      )}
    </div>
  )
}
