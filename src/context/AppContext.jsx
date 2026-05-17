import { createContext, useContext, useState, useEffect } from 'react'
import { getSpoilagePrediction, STORAGE_TEMPERATURES } from '../services/api'

const AppContext = createContext(null)

const DEMO_PRODUCTS = [
  { id: 1, name: 'domates',      quantity: 2,   unit: 'kg',  category: 'Vegetables',   storageLocation: 'refrigerator', isOpened: false, expiryDate: getDateFromNow(2),   predictedDays: null },
  { id: 2, name: 'yumurta',      quantity: 6,   unit: 'pcs', category: 'Cooked_Meals', storageLocation: 'refrigerator', isOpened: false, expiryDate: getDateFromNow(1),   predictedDays: null },
  { id: 3, name: 'biber',        quantity: 3,   unit: 'pcs', category: 'Vegetables',   storageLocation: 'room temp',    isOpened: true,  expiryDate: getDateFromNow(4),   predictedDays: null },
  { id: 4, name: 'süt',          quantity: 1,   unit: 'L',   category: 'Liquid_Dairy', storageLocation: 'refrigerator', isOpened: true,  expiryDate: getDateFromNow(3),   predictedDays: null },
  { id: 5, name: 'tavuk',        quantity: 0.5, unit: 'kg',  category: 'Meat_Poultry', storageLocation: 'freezer',      isOpened: false, expiryDate: getDateFromNow(30),  predictedDays: null },
  { id: 6, name: 'makarna',      quantity: 400, unit: 'g',   category: 'Cooked_Meals', storageLocation: 'room temp',    isOpened: false, expiryDate: getDateFromNow(180), predictedDays: null },
  { id: 7, name: 'peynir',       quantity: 200, unit: 'g',   category: 'Hard_Cheese',  storageLocation: 'refrigerator', isOpened: true,  expiryDate: getDateFromNow(0),   predictedDays: null },
  { id: 8, name: 'sarımsak',     quantity: 2,   unit: 'head',category: 'Vegetables',   storageLocation: 'room temp',    isOpened: false, expiryDate: getDateFromNow(21),  predictedDays: null },
]

function getDateFromNow(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

export function AppProvider({ children }) {
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('products')
      if (saved) {
        const parsed = JSON.parse(saved)
        const hasEnglish = parsed.some(p =>
          ['tomato','eggs','milk','chicken','pasta','cheese','garlic','bell pepper']
            .includes(p.name.toLowerCase())
        )
        if (hasEnglish) return DEMO_PRODUCTS
        return parsed
      }
      return DEMO_PRODUCTS
    } catch {
      return DEMO_PRODUCTS
    }
  })

  const [shoppingList, setShoppingList] = useState(() => {
    try {
      const saved = localStorage.getItem('shoppingList')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products))
  }, [products])

  useEffect(() => {
    localStorage.setItem('shoppingList', JSON.stringify(shoppingList))
  }, [shoppingList])

  async function addProduct(product) {

  if (product.expiryDate) {
    const newProduct = { ...product, id: Date.now(), predictedDays: null }
    setProducts(prev => [...prev, newProduct])
    return
  }


  const tempId = Date.now()
  const newProduct = { ...product, id: tempId, predictedDays: null, expiryDate: null }
  setProducts(prev => [...prev, newProduct])

  const temperature = STORAGE_TEMPERATURES[product.storageLocation] ?? 4
  const days = await getSpoilagePrediction(product.category, temperature, product.isOpened)

  if (days !== null) {
    const aiExpiryDate = getDateFromNow(days)
    setProducts(prev =>
      prev.map(p =>
        p.id === tempId
          ? { ...p, predictedDays: days, expiryDate: aiExpiryDate }
          : p
      )
    )
  }
}

  function removeProduct(id) {
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  function updateProduct(id, updates) {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  }

  // Uses predictedDays from AI backend when available, otherwise calculates from expiryDate
  function getDaysUntilExpiry(product) {
   if (!product.expiryDate) return null
   const today = new Date()
   today.setHours(0, 0, 0, 0)
   const expiry = new Date(product.expiryDate)
   expiry.setHours(0, 0, 0, 0)
   return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24))
}

  function addToShoppingList(item) {
    setShoppingList(prev => {
      const exists = prev.find(i => i.name.toLowerCase() === item.name.toLowerCase())
      if (exists) return prev
      return [...prev, { ...item, id: Date.now(), checked: false }]
    })
  }

  function toggleShoppingItem(id) {
    setShoppingList(prev => prev.map(i => i.id === id ? { ...i, checked: !i.checked } : i))
  }

  function removeShoppingItem(id) {
    setShoppingList(prev => prev.filter(i => i.id !== id))
  }

  function clearCheckedItems() {
    setShoppingList(prev => prev.filter(i => !i.checked))
  }

  const criticalProducts = products
  .map(p => ({ ...p, daysLeft: getDaysUntilExpiry(p) }))
  .filter(p => p.daysLeft !== null && p.daysLeft <= 3)
  .sort((a, b) => a.daysLeft - b.daysLeft)

  return (
    <AppContext.Provider value={{
      products,
      addProduct,
      removeProduct,
      updateProduct,
      getDaysUntilExpiry,
      criticalProducts,
      shoppingList,
      addToShoppingList,
      toggleShoppingItem,
      removeShoppingItem,
      clearCheckedItems,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
