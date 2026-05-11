const BASE = '/api'

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`API Error: ${res.status}`)
  return res.json()
}

// POST /ai-recommend/ — sends ingredients, backend returns Turkish recipes from AI model
// Falls back to GET /recipes/ (DB), then mock if both unavailable
export async function getRecipeSuggestions(ingredients) {
  // Try AI endpoint first
  try {
    const aiData = await request('/ai-recommend/', {
      method: 'POST',
      body: JSON.stringify(ingredients),
    })
    if (Array.isArray(aiData) && aiData.length > 0) {
      const userNames = ingredients.map(i => i.toLowerCase())
      return aiData.map((r, i) => {
        const recipeIngredients = String(r.ingredient_str ?? '')
          .split(',').map(s => s.trim()).filter(Boolean)
        const steps = String(r.instructions ?? '')
          .split('\n').map(s => s.trim()).filter(Boolean)
        const matchCount = recipeIngredients.filter(ing =>
          userNames.some(n => n.includes(ing) || ing.includes(n))
        ).length
        return {
          id: r.id ?? i,
          name: r.name,
          ingredients: recipeIngredients,
          steps,
          duration: 'N/A',
          difficulty: 'N/A',
          matchCount,
          matchRatio: recipeIngredients.length > 0 ? matchCount / recipeIngredients.length : 0,
        }
      })
    }
  } catch { /* fall through */ }

  // Try DB recipes
  try {
    const data = await request('/recipes/')
    if (Array.isArray(data) && data.length > 0) {
      const userNames = ingredients.map(i => i.toLowerCase())
      const transformed = data.map(r => {
        const recipeIngredients = String(r.ingredient_str ?? '')
          .split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
        const steps = String(r.instructions ?? '')
          .split('\n').map(s => s.trim()).filter(Boolean)
        const matchCount = recipeIngredients.filter(ing =>
          userNames.some(n => n.includes(ing) || ing.includes(n))
        ).length
        return {
          id: r.id,
          name: r.name,
          ingredients: recipeIngredients,
          steps,
          duration: 'N/A',
          difficulty: 'N/A',
          matchCount,
          matchRatio: recipeIngredients.length > 0 ? matchCount / recipeIngredients.length : 0,
        }
      })
      const scored = transformed.filter(r => r.matchCount > 0).sort((a, b) => b.matchRatio - a.matchRatio)
      if (scored.length > 0) return scored
    }
  } catch { /* fall through */ }

  return getMockRecipes(ingredients)
}

// POST /predict — returns predicted_days_left from XGBoost model
export async function getSpoilagePrediction(category, temperatureC, isOpened) {
  try {
    const data = await request('/predict', {
      method: 'POST',
      body: JSON.stringify({
        Category: category,
        Temperature_C: temperatureC,
        Is_Package_Open: isOpened ? 1 : 0,
      }),
    })
    return data.predicted_days_left ?? null
  } catch {
    return null
  }
}

// Storage location → temperature mapping (matches backend storage_locations table)
export const STORAGE_TEMPERATURES = {
  refrigerator: 4,
  freezer: -18,
  'room temp': 22,
}

function getMockRecipes(ingredients) {
  const names = ingredients.map(i => i.toLowerCase())
  const all = [
    {
      id: 1,
      name: 'Domates Çorbası',
      duration: '25 dk',
      difficulty: 'Kolay',
      ingredients: ['domates', 'soğan', 'sarımsak', 'zeytinyağı'],
      steps: [
        'Soğan ve sarımsağı kavurun.',
        'Domatesleri ekleyip 10 dakika pişirin.',
        'Blenderdan geçirin, tuz ve karabiber ekleyin.',
        'Sıcak servis yapın.',
      ],
    },
    {
      id: 2,
      name: 'Tavuklu Makarna',
      duration: '30 dk',
      difficulty: 'Orta',
      ingredients: ['tavuk', 'makarna', 'soğan', 'sarımsak', 'domates'],
      steps: [
        'Tavuğu küp küp kesip kavurun.',
        'Soğan ve sarımsak ekleyin.',
        'Domates ekleyip sos yapın.',
        'Makarnayı haşlayıp sosla karıştırın.',
      ],
    },
    {
      id: 3,
      name: 'Menemen',
      duration: '15 dk',
      difficulty: 'Kolay',
      ingredients: ['yumurta', 'domates', 'biber'],
      steps: [
        'Biberi kavurun.',
        'Domatesleri ekleyip 5 dakika pişirin.',
        'Yumurtaları kırıp karıştırarak pişirin.',
        'Tuz ekleyip servis yapın.',
      ],
    },
    {
      id: 4,
      name: 'Sarımsaklı Yoğurt',
      duration: '5 dk',
      difficulty: 'Kolay',
      ingredients: ['yoğurt', 'sarımsak'],
      steps: [
        'Sarımsağı rendeleyin.',
        'Yoğurtla karıştırın.',
        'Tuz ekleyin.',
        'Soğuk servis yapın.',
      ],
    },
    {
      id: 5,
      name: 'Peynirli Omlet',
      duration: '10 dk',
      difficulty: 'Kolay',
      ingredients: ['yumurta', 'peynir'],
      steps: [
        'Yumurtaları çırpın.',
        'Tereyağlı tavaya dökün.',
        'Üzerine peynir rendeleyin.',
        'İkiye katlayıp servis yapın.',
      ],
    },
    {
      id: 6,
      name: 'Tavuk Sote',
      duration: '25 dk',
      difficulty: 'Orta',
      ingredients: ['tavuk', 'biber', 'soğan', 'domates'],
      steps: [
        'Soğanı kavurun.',
        'Tavuğu ekleyip pişirin.',
        'Biber ve domatesleri ekleyin.',
        'Tuz ve baharatla tatlandırın.',
      ],
    },
  ]

  const scored = all.map(r => {
    const matchCount = r.ingredients.filter(ing =>
      names.some(n => n.includes(ing.toLowerCase()) || ing.toLowerCase().includes(n))
    ).length
    return { ...r, matchCount, matchRatio: matchCount / r.ingredients.length }
  })

  return scored
    .filter(r => r.matchCount > 0)
    .sort((a, b) => b.matchRatio - a.matchRatio)
}
