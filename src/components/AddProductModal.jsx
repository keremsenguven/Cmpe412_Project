import { useState } from 'react'
import './AddProductModal.css'

// Category names match the backend /predict endpoint expectations
export const CATEGORIES = [
  { value: 'Vegetables',      label: '🥦 Vegetables' },
  { value: 'Fruits',          label: '🍎 Fruits' },
  { value: 'Meat_Poultry',    label: '🍗 Meat & Poultry' },
  { value: 'Liquid_Dairy',    label: '🥛 Liquid Dairy (milk, yogurt)' },
  { value: 'Hard_Cheese',     label: '🧀 Hard Cheese' },
  { value: 'Fermented_Dairy', label: '🫙 Fermented Dairy' },
  { value: 'Cooked_Meals',    label: '🍲 Cooked Meals / Grains' },
]

const UNITS = ['kg', 'g', 'L', 'ml', 'pcs', 'slice', 'bunch', 'pack', 'box', 'head']

const STORAGE_LOCATIONS = [
  { value: 'refrigerator', label: '❄️ Refrigerator (4°C)' },
  { value: 'freezer',      label: '🧊 Freezer (-18°C)' },
  { value: 'room temp',    label: '🌡️ Room Temperature (22°C)' },
]

const EMPTY = {
  name: '',
  quantity: '',
  unit: 'kg',
  category: 'Vegetables',
  storageLocation: 'refrigerator',
  isOpened: false,
  expiryDate: '',
}

export default function AddProductModal({ onClose, onAdd }) {
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) return setError('Please enter a product name.')
    if (!form.quantity || Number(form.quantity) <= 0) return setError('Please enter a valid quantity.')
    if (!form.expiryDate) return setError('Please enter an expiry date.')
    onAdd({ ...form, quantity: Number(form.quantity) })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Product</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="field">
            <label>Product Name</label>
            <input
              type="text"
              placeholder="e.g. Tomato"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              autoFocus
            />
          </div>

          <div className="field-row">
            <div className="field">
              <label>Quantity</label>
              <input
                type="number"
                min="0.1"
                step="any"
                placeholder="1"
                value={form.quantity}
                onChange={e => set('quantity', e.target.value)}
              />
            </div>
            <div className="field">
              <label>Unit</label>
              <select value={form.unit} onChange={e => set('unit', e.target.value)}>
                {UNITS.map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label>Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Storage Location</label>
              <select value={form.storageLocation} onChange={e => set('storageLocation', e.target.value)}>
                {STORAGE_LOCATIONS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <label>Expiry Date</label>
            <input
              type="date"
              value={form.expiryDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => set('expiryDate', e.target.value)}
            />
          </div>

          <div className="field field-checkbox">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.isOpened}
                onChange={e => set('isOpened', e.target.checked)}
              />
              <span>Package already opened</span>
            </label>
            <p className="field-hint">Opened packages spoil faster — the AI model will adjust its prediction.</p>
          </div>

          {error && <p className="form-error">⚠ {error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Add</button>
          </div>
        </form>
      </div>
    </div>
  )
}
