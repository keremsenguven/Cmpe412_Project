import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { getRecipeSuggestions } from '../services/api'
import './Recipes.css'

export default function Recipes() {
  const { products, addToShoppingList } = useApp()
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)
  const [searched, setSearched] = useState(false)

  async function fetchRecipes() {
    setLoading(true)
    setSearched(true)
    try {
      const names = products.map(p => p.name)
      const result = await getRecipeSuggestions(names)
      setRecipes(result)
    } finally {
      setLoading(false)
    }
  }

  function addMissingToCart(recipe) {
    const productNames = products.map(p => p.name.toLowerCase())
    recipe.ingredients.forEach(ing => {
      if (!productNames.some(n => n.includes(ing) || ing.includes(n))) {
        addToShoppingList({ name: ing, quantity: 1, unit: 'pcs' })
      }
    })
  }

  function getMissingIngredients(recipe) {
    const productNames = products.map(p => p.name.toLowerCase())
    return recipe.ingredients.filter(ing =>
      !productNames.some(n => n.includes(ing) || ing.includes(n))
    )
  }

  function getMatchPercent(recipe) {
    const missing = getMissingIngredients(recipe)
    return Math.round(((recipe.ingredients.length - missing.length) / recipe.ingredients.length) * 100)
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Tarif Önerileri</h1>
        <p className="subtitle">Elinizdekilerle ne pişirebilirsiniz?</p>
      </div>

      <div className="recipe-action-bar">
        <div className="ingredients-summary">
          <span>🧺</span>
          <span>Dolabınızda <strong>{products.length}</strong> ürün var</span>
        </div>
        <button className="btn-suggest" onClick={fetchRecipes} disabled={loading || products.length === 0}>
          {loading ? '⏳ Aranıyor...' : '✨ Tarif Öner'}
        </button>
      </div>

      {!searched && (
        <div className="recipe-intro">
          <div className="intro-icon">👨‍🍳</div>
          <p>Mevcut malzemelerinize uygun tarifleri bulmak için "Tarif Öner" butonuna tıklayın!</p>
        </div>
      )}

      {searched && !loading && recipes.length === 0 && (
        <div className="empty-state">
          <span>😕</span>
          <p>Eşleşen tarif bulunamadı. Dolabınıza daha fazla ürün eklemeyi deneyin!</p>
        </div>
      )}

      <div className="recipes-grid">
        {recipes.map(recipe => {
          const missing = getMissingIngredients(recipe)
          const matchPct = getMatchPercent(recipe)
          return (
            <div key={recipe.id} className={`recipe-card ${selected?.id === recipe.id ? 'expanded' : ''}`}>
              <div className="recipe-card-header" onClick={() => setSelected(selected?.id === recipe.id ? null : recipe)}>
                <div className="recipe-title-row">
                  <h3>{recipe.name}</h3>
                  <span className="recipe-arrow">{selected?.id === recipe.id ? '▲' : '▼'}</span>
                </div>
                <div className="recipe-meta">
                  <span className="meta-chip">⏱ {recipe.duration}</span>
                  <span className="meta-chip">📊 {recipe.difficulty}</span>
                  <span className={`meta-chip match-chip ${matchPct === 100 ? 'match-full' : matchPct >= 60 ? 'match-good' : 'match-partial'}`}>
                    %{matchPct} eşleşme
                  </span>
                </div>
                <div className="ingredient-tags">
                  {recipe.ingredients.map(ing => {
                    const have = !missing.includes(ing)
                    return (
                      <span key={ing} className={`ing-tag ${have ? 'ing-have' : 'ing-missing'}`}>
                        {have ? '✓' : '✗'} {ing}
                      </span>
                    )
                  })}
                </div>
              </div>

              {selected?.id === recipe.id && (
                <div className="recipe-details">
                  <h4>Yapılışı</h4>
                  <ol className="steps-list">
                    {recipe.steps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                  {missing.length > 0 && (
                    <div className="missing-section">
                      <p className="missing-title">Eksik: {missing.join(', ')}</p>
                      <button
                        className="btn-add-cart"
                        onClick={() => addMissingToCart(recipe)}
                      >
                        🛒 Eksikleri Alışveriş Listesine Ekle
                      </button>
                    </div>
                  )}
                  {missing.length === 0 && (
                    <div className="ready-banner">✅ Tüm malzemeler mevcut! Pişirmeye hazır.</div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
