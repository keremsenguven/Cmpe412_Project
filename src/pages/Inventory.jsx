import { useState } from 'react'
import { useApp } from '../context/AppContext'
import ExpiryBadge from '../components/ExpiryBadge'
import AddProductModal from '../components/AddProductModal'
import './Inventory.css'

const CATEGORY_ICONS = {
  vegetable: '🥦', fruit: '🍎', meat: '🍗', dairy: '🥛',
  animal: '🥚', grain: '🌾', legume: '🫘', other: '📦',
}

const STORAGE_ICONS = {
  refrigerator: '❄️',
  freezer: '🧊',
  'room temp': '🌡️',
}

export default function Inventory() {
  const { products, addProduct, removeProduct, getDaysUntilExpiry, addToShoppingList, updateProduct } = useApp()
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('expiry')
  const [filterCategory, setFilterCategory] = useState('all')

  const categories = ['all', ...new Set(products.map(p => p.category))]

  const filtered = products
    .filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
      const matchCat = filterCategory === 'all' || p.category === filterCategory
      return matchSearch && matchCat
    })
    .map(p => ({ ...p, daysLeft: getDaysUntilExpiry(p) }))
    .sort((a, b) => {
      if (sortBy === 'expiry') return a.daysLeft - b.daysLeft
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      return 0
    })

  return (
    <div className="page">
      <div className="page-header inv-header">
        <div>
          <h1>Pantry</h1>
          <p className="subtitle">{products.length} products stored</p>
        </div>
        <button className="btn-add" onClick={() => setShowModal(true)}>
          + Add Product
        </button>
      </div>

      <div className="inv-controls">
        <input
          className="search-input"
          type="search"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="filter-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          {categories.map(c => (
            <option key={c} value={c}>
              {c === 'all' ? 'All Categories' : `${CATEGORY_ICONS[c] ?? '📦'} ${c}`}
            </option>
          ))}
        </select>
        <select className="filter-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="expiry">Sort by Expiry</option>
          <option value="name">Sort by Name</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <span>🧺</span>
          <p>No products found. Add something new!</p>
        </div>
      ) : (
        <div className="product-table-wrapper">
          <table className="product-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Storage</th>
                <th>Opened</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(product => (
                <tr
                  key={product.id}
                  className={product.daysLeft < 0 ? 'row-expired' : product.daysLeft <= 2 ? 'row-critical' : ''}
                >
                  <td className="col-name">
                    <span className="product-icon">{CATEGORY_ICONS[product.category] ?? '📦'}</span>
                    <span>{product.name}</span>
                  </td>
                  <td className="col-category">{product.category}</td>
                  <td className="col-qty">{product.quantity} {product.unit}</td>
                  <td className="col-storage">
                    <span title={product.storageLocation}>
                      {STORAGE_ICONS[product.storageLocation] ?? '📦'} {product.storageLocation}
                    </span>
                  </td>
                  <td className="col-opened">
                    <button
                      className={`opened-toggle ${product.isOpened ? 'is-opened' : 'not-opened'}`}
                      onClick={() => updateProduct(product.id, { isOpened: !product.isOpened })}
                      title="Toggle opened status"
                    >
                      {product.isOpened ? 'Opened' : 'Sealed'}
                    </button>
                  </td>
                  <td className="col-date">
                    {new Date(product.expiryDate).toLocaleDateString('en-GB')}
                    {product.predictedDays !== null && (
                      <span className="ai-label">AI</span>
                    )}
                  </td>
                  <td className="col-status">
                    <ExpiryBadge days={product.daysLeft} />
                  </td>
                  <td className="col-actions">
                    <button
                      className="action-btn action-cart"
                      title="Add to shopping list"
                      onClick={() => addToShoppingList({ name: product.name, quantity: product.quantity, unit: product.unit })}
                    >
                      🛒
                    </button>
                    <button
                      className="action-btn action-delete"
                      title="Delete"
                      onClick={() => removeProduct(product.id)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <AddProductModal
          onClose={() => setShowModal(false)}
          onAdd={addProduct}
        />
      )}
    </div>
  )
}
