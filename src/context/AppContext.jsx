import { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext(null)

const DEMO_PRODUCTS = [
  { id: 1, name: 'Tomato',        quantity: 2,   unit: 'kg',  category: 'vegetable', storageLocation: 'refrigerator', isOpened: false, expiryDate: getDateFromNow(2),   predictedDays: null },
  { id: 2, name: 'Eggs',          quantity: 6,   unit: 'pcs', category: 'animal',    storageLocation: 'refrigerator', isOpened: false, expiryDate: getDateFromNow(1),   predictedDays: null },
  { id: 3, name: 'Bell Pepper',   quantity: 3,   unit: 'pcs', category: 'vegetable', storageLocation: 'room temp',    isOpened: true,  expiryDate: getDateFromNow(4),   predictedDays: null },
  { id: 4, name: 'Milk',          quantity: 1,   unit: 'L',   category: 'dairy',     storageLocation: 'refrigerator', isOpened: true,  expiryDate: getDateFromNow(3),   predictedDays: null },
  { id: 5, name: 'Chicken',       quantity: 0.5, unit: 'kg',  category: 'meat',      storageLocation: 'freezer',      isOpened: false, expiryDate: getDateFromNow(30),  predictedDays: null },
  { id: 6, name: 'Pasta',         quantity: 400, unit: 'g',   category: 'grain',     storageLocation: 'room temp',    isOpened: false, expiryDate: getDateFromNow(180), predictedDays: null },
  { id: 7, name: 'Cheese',        quantity: 200, unit: 'g',   category: 'dairy',     storageLocation: 'refrigerator', isOpened: true,  expiryDate: getDateFromNow(0),   predictedDays: null },
  { id: 8, name: 'Garlic',        quantity: 2,   unit: 'head',category: 'vegetable', storageLocation: 'room temp',    isOpened: false, expiryDate: getDateFromNow(21),  predictedDays: null },
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
      return saved ? JSON.parse(saved) : DEMO_PRODUCTS
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

  function addProduct(product) {
    setProducts(prev => [...prev, { ...product, id: Date.now(), predictedDays: null }])
  }

  function removeProduct(id) {
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  function updateProduct(id, updates) {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  }

  // Uses predictedDays from AI backend when available, otherwise calculates from expiryDate
  function getDaysUntilExpiry(product) {
    if (product.predictedDays !== null && product.predictedDays !== undefined) {
      return product.predictedDays
    }
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
    .filter(p => p.daysLeft <= 3)
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
