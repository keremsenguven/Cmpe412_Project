#Turkish Recipe Recommendation System
## AI Expert A — NLP-Based Ingredient Matching

## Overview
This module recommends Turkish recipes based on ingredients the user has at home.
It uses a **Hybrid Model** combining Word2Vec embeddings and TF-IDF vectorization
with Cosine Similarity to find the most relevant recipes.

## How It Works
```
User Input (ingredients)
        ↓
  Word2Vec Embeddings  +  TF-IDF Vectorization
        ↓
    Cosine Similarity (Hybrid Score = 0.4 × W2V + 0.6 × TF-IDF)
        ↓
  Top-N Recipe Results
  (name + ingredients with quantities + instructions)
```

## Dataset
- **Source:** [mertbozkurt/llama2-TR-recipe](https://huggingface.co/datasets/mertbozkurt/llama2-TR-recipe) (HuggingFace)
- **Size:** 3,250 Turkish recipes (after cleaning)
- **Language:** Turkish
- **Fields:** recipe name, ingredients (with quantities), instructions

## Model
- **Word2Vec** — semantic ingredient similarity (vector_size=100, epochs=100)
- **TF-IDF** — precise ingredient matching (vocabulary: 776 tokens)
- **Hybrid Score** = 0.4 × Word2Vec + 0.6 × TF-IDF

## Requirements
```bash
pip install pandas scikit-learn gensim datasets matplotlib
```

## Usage

### Load Model
```python
import pickle
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import normalize
import numpy as np

with open('recommendation_model_hybrid.pkl', 'rb') as f:
    model = pickle.load(f)

w2v_model           = model['w2v_model']
tfidf_vectorizer    = model['tfidf_vectorizer']
tfidf_matrix        = model['tfidf_matrix']
recipe_vectors_norm = model['recipe_vectors_norm']
df                  = model['df']
```

### Recommend Function
```python
def recommend_hybrid(user_ingredients, top_n=5, w2v_weight=0.4, tfidf_weight=0.6):
    user_vectors = [w2v_model.wv[i] for i in user_ingredients if i in w2v_model.wv]
    if user_vectors:
        user_vec_w2v = normalize(np.mean(user_vectors, axis=0).reshape(1, -1))
        scores_w2v   = cosine_similarity(user_vec_w2v, recipe_vectors_norm).flatten()
    else:
        scores_w2v = np.zeros(len(df))

    user_vec_tfidf = tfidf_vectorizer.transform([' '.join(user_ingredients)])
    scores_tfidf   = cosine_similarity(user_vec_tfidf, tfidf_matrix).flatten()

    hybrid_scores = w2v_weight * scores_w2v + tfidf_weight * scores_tfidf
    top_indices   = hybrid_scores.argsort()[::-1]

    results = []
    for idx in top_indices[:top_n]:
        results.append({
            'recipe'      : df['recipe_name'].iloc[idx],
            'score'       : round(float(hybrid_scores[idx]), 3),
            'ingredients' : df['ingredient_str'].iloc[idx],
            'instructions': df['instructions'].iloc[idx]
        })
    return results
```

### Example
```python
results = recommend_hybrid(['kıyma', 'soğan', 'domates'])

for r in results:
    print(f"Recipe : {r['recipe']} (Score: {r['score']})")
    print(f"Ingredients: {r['ingredients']}")
    print()
```

### Output
```
Recipe      : Kıymalı Çiğ Börek (Score: 0.878)

Ingredients:
  - 2 su bardağı su
  - 3 su bardağı un
  - 250 gr kıyma
  - 2 adet soğan
  - 2 adet domates
  - Karabiber
  - Kızartmak için sıvı yağ

Instructions:
  Çiğ börek hamuru için; derin bir kaba 2 su bardağı su ve 1 tatlı
  kaşığı tuz koyun. Üzerine 2 buçuk - 3 su bardağı unu azar azar
  ekleyin. Ele yapışmayan yumuşak bir hamur elde edene kadar yoğurun...
```

## FastAPI Integration
```python
from fastapi import FastAPI
import pickle

app = FastAPI()

@app.on_event("startup")
async def startup():
    with open('recommendation_model_hybrid.pkl', 'rb') as f:
        model = pickle.load(f)

@app.post("/recommend")
async def recommend(ingredients: list[str]):
    return recommend_hybrid(ingredients, top_n=5)
```

## Files
| File | Description |
|------|-------------|
| `word2vec.ipynb` | Full pipeline: data loading, EDA, cleaning, modeling, evaluation |
| `recommendation_model_hybrid.pkl` | Trained hybrid model (Word2Vec + TF-IDF) |
| `recipes_clean.csv` | Cleaned dataset (3,250 recipes) for database |

## Test Results (Hybrid Model)
| Category | Input | Top Result | Score |
|----------|-------|-----------|-------|
| Et / Kıyma | kıyma, soğan, domates | Kıymalı Çiğ Börek | 0.878 |
| Kahvaltı | yumurta, domates, biber, tereyağı | Soğansız Menemen | 0.708 |
| Çorba | mercimek, soğan, havuç | Patatesli Mercimek Çorbası | 0.737 |
| Börek | yufka, peynir, yumurta, tereyağı | Tek Yufka Böreği | 0.753 |
| Meze | kabak, yoğurt, sarımsak, dereotu | Kabaklı Cacık | 0.962 |
| Tatlı | elma, tarçın, toz şeker, tereyağı | Elmalı Crumble | 0.839 |
| Makarna | makarna, kıyma, domates | Fırında Beşamel Soslu Kıymalı Makarna | 0.752 |
| Patates | patates, yumurta, soğan, zeytinyağı | İspanyol Omleti | 0.871 |


