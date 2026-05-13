import { useState } from 'react'
import { useApp } from '../context/AppContext'
import './ShoppingList.css'

export default function ShoppingList() {
  const { shoppingList, toggleShoppingItem, removeShoppingItem, clearCheckedItems, addToShoppingList } = useApp()
  const [newItem, setNewItem] = useState('')

  const pending = shoppingList.filter(i => !i.checked)
  const done = shoppingList.filter(i => i.checked)

  function handleAddManual(e) {
    e.preventDefault()
    if (!newItem.trim()) return
    addToShoppingList({ name: newItem.trim(), quantity: 1, unit: 'pcs' })
    setNewItem('')
  }

  return (
    <div className="page">
      <div className="page-header sl-header">
        <div>
          <h1>Alışveriş Listesi</h1>
          <p className="subtitle">{pending.length} ürün bekliyor</p>
        </div>
        {done.length > 0 && (
          <button className="btn-clear" onClick={clearCheckedItems}>
            🗑️ Tamamlananları Temizle ({done.length})
          </button>
        )}
      </div>

      <form className="manual-add" onSubmit={handleAddManual}>
        <input
          type="text"
          placeholder="Manuel ekle..."
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          className="manual-input"
        />
        <button type="submit" className="btn-add-manual">Ekle</button>
      </form>

      {shoppingList.length === 0 && (
        <div className="empty-state">
          <span>🛒</span>
          <p>Alışveriş listeniz boş. Tarifler sayfasından eksik malzemeleri ekleyin!</p>
        </div>
      )}

      {pending.length > 0 && (
        <div className="sl-section">
          <h2 className="sl-section-title">Alınacaklar ({pending.length})</h2>
          <div className="sl-list">
            {pending.map(item => (
              <div key={item.id} className="sl-item">
                <button
                  className="sl-check unchecked"
                  onClick={() => toggleShoppingItem(item.id)}
                  title="Mark as bought"
                >
                  ○
                </button>
                <div className="sl-item-info">
                  <span className="sl-item-name">{item.name}</span>
                  <span className="sl-item-qty">{item.quantity} {item.unit}</span>
                </div>
                <button
                  className="sl-remove"
                  onClick={() => removeShoppingItem(item.id)}
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {done.length > 0 && (
        <div className="sl-section">
          <h2 className="sl-section-title done-title">Alındı ({done.length})</h2>
          <div className="sl-list">
            {done.map(item => (
              <div key={item.id} className="sl-item sl-item-done">
                <button
                  className="sl-check checked"
                  onClick={() => toggleShoppingItem(item.id)}
                  title="Undo"
                >
                  ✓
                </button>
                <div className="sl-item-info">
                  <span className="sl-item-name">{item.name}</span>
                  <span className="sl-item-qty">{item.quantity} {item.unit}</span>
                </div>
                <button
                  className="sl-remove"
                  onClick={() => removeShoppingItem(item.id)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
