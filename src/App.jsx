import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import Recipes from './pages/Recipes'
import ShoppingList from './pages/ShoppingList'
import './App.css'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pantry" element={<Inventory />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/shopping" element={<ShoppingList />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AppProvider>
  )
}
