import { useState } from 'react'
import './AddProductModal.css'

// Category names match the backend /predict endpoint expectations
export const CATEGORIES = [
  { value: 'Vegetables',      label: '🥦 Sebzeler' },
  { value: 'Fruits',          label: '🍎 Meyveler' },
  { value: 'Meat_Poultry',    label: '🍗 Et & Tavuk' },
  { value: 'Liquid_Dairy',    label: '🥛 Sıvı Süt Ürünleri (süt, yoğurt)' },
  { value: 'Hard_Cheese',     label: '🧀 Sert Peynir' },
  { value: 'Fermented_Dairy', label: '🫙 Fermente Süt Ürünleri' },
  { value: 'Cooked_Meals',    label: '🍲 Pişmiş Yemek / Tahıl' },
]

const UNITS = ['kg', 'g', 'L', 'ml', 'adet', 'dilim', 'demet', 'paket', 'kutu', 'baş']

const STORAGE_LOCATIONS = [
  { value: 'refrigerator', label: '❄️ Buzdolabı (4°C)' },
  { value: 'freezer',      label: '🧊 Dondurucu (-18°C)' },
  { value: 'room temp',    label: '🌡️ Oda Sıcaklığı (22°C)' },
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
    if (!form.name.trim()) return setError('Lütfen ürün adı girin.')
    if (!form.quantity || Number(form.quantity) <= 0) return setError('Lütfen geçerli bir miktar girin.')
    if (!form.expiryDate) return setError('Lütfen son kullanma tarihi girin.')
    onAdd({ ...form, quantity: Number(form.quantity) })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Ürün Ekle</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="field">
            <label>Ürün Adı</label>
            <input
              type="text"
              placeholder="örn. domates"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              autoFocus
            />
          </div>

          <div className="field-row">
            <div className="field">
              <label>Miktar</label>
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
              <label>Birim</label>
              <select value={form.unit} onChange={e => set('unit', e.target.value)}>
                {UNITS.map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label>Kategori</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Depolama Yeri</label>
              <select value={form.storageLocation} onChange={e => set('storageLocation', e.target.value)}>
                {STORAGE_LOCATIONS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <label>Son Kullanma Tarihi</label>
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
              <span>Paket açık</span>
            </label>
            <p className="field-hint">Açık paketler daha hızlı bozulur — AI modeli tahmini buna göre ayarlar.</p>
          </div>

          {error && <p className="form-error">⚠ {error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>İptal</button>
            <button type="submit" className="btn-primary">Ekle</button>
          </div>
        </form>
      </div>
    </div>
  )
}
