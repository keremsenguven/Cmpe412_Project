const BASE = '/api'

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`API Error: ${res.status}`)
  return res.json()
}

export async function getRecipeSuggestions(ingredients) {
  try {
    return await request('/recipes/suggest', {
      method: 'POST',
      body: JSON.stringify({ ingredients }),
    })
  } catch {
    return getMockRecipes(ingredients)
  }
}

export async function getProductExpiry(productName) {
  try {
    return await request(`/products/expiry?name=${encodeURIComponent(productName)}`)
  } catch {
    return null
  }
}

function getMockRecipes(ingredients) {
  const names = ingredients.map(i => i.toLowerCase())
  const all = [
    {
      id: 1,
      name: 'Tomato Soup',
      duration: '25 min',
      difficulty: 'Easy',
      ingredients: ['tomato', 'onion', 'garlic', 'olive oil'],
      steps: [
        'Sauté onion and garlic until soft.',
        'Add tomatoes and cook for 10 minutes.',
        'Blend until smooth, season with salt and pepper.',
        'Serve hot.',
      ],
    },
    {
      id: 2,
      name: 'Chicken Pasta',
      duration: '30 min',
      difficulty: 'Medium',
      ingredients: ['chicken breast', 'pasta', 'onion', 'garlic', 'tomato'],
      steps: [
        'Dice chicken and sauté until cooked.',
        'Add onion and garlic.',
        'Add tomatoes to make the sauce.',
        'Cook pasta and toss with the sauce.',
      ],
    },
    {
      id: 3,
      name: 'Scrambled Eggs with Tomato',
      duration: '15 min',
      difficulty: 'Easy',
      ingredients: ['eggs', 'tomato', 'onion'],
      steps: [
        'Sauté onion until translucent.',
        'Add diced tomatoes and cook for 5 minutes.',
        'Crack in eggs and stir until cooked.',
        'Season and serve.',
      ],
    },
    {
      id: 4,
      name: 'Garlic Yogurt Dip',
      duration: '5 min',
      difficulty: 'Easy',
      ingredients: ['yogurt', 'garlic'],
      steps: [
        'Grate garlic finely.',
        'Mix with yogurt.',
        'Add salt to taste.',
        'Serve cold.',
      ],
    },
    {
      id: 5,
      name: 'Cheese Omelette',
      duration: '10 min',
      difficulty: 'Easy',
      ingredients: ['eggs', 'cheese'],
      steps: [
        'Beat eggs well.',
        'Pour into a buttered pan.',
        'Grate cheese on top.',
        'Fold in half and serve.',
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
