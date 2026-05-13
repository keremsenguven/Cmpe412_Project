from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models, schemas
from database import SessionLocal, engine
import pandas as pd
import pickle
from pydantic import BaseModel
import xgboost as xgb
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import normalize

# Automatically create database tables based on models
models.Base.metadata.create_all(bind=engine)
app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Herkese izin ver (Test aşamasında olduğumuz için)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- LOAD AI MODELS ---

# Load Kerem's Spoilage Prediction Model
spoilage_model = xgb.XGBRegressor()
spoilage_model.load_model('xgboost_spoilage_model.json')

# Load Sevval's Recipe Recommendation Data and Model
recipes_df = pd.read_csv("recipes_clean.csv")

with open("recommendation_model_hybrid.pkl", "rb") as f:
    ai_model = pickle.load(f)


# --- SCHEMAS (FOR KEREM'S AI ENDPOINT) ---

class FoodItem(BaseModel):
    Category: str  # e.g., 'Vegetables', 'Meat_Poultry'
    Temperature_C: float
    Is_Package_Open: int  # 0 or 1


# --- DATABASE CONNECTION ---

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/")
def home():
    return {"message": "Smart Kitchen API is Running Successfully!"}


# --- RECIPE ENDPOINTS ---

@app.post("/recipes/", response_model=schemas.Recipe)
def create_recipe(recipe: schemas.RecipeCreate, db: Session = Depends(get_db)):
    db_recipe = models.Recipe(
        name=recipe.name,
        ingredient_str=recipe.ingredient_str,
        instructions=recipe.instructions
    )
    db.add(db_recipe)
    db.commit()
    db.refresh(db_recipe)
    return db_recipe


@app.get("/recipes/", response_model=List[schemas.Recipe])
def read_recipes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    recipes = db.query(models.Recipe).offset(skip).limit(limit).all()
    return recipes


@app.delete("/recipes/{recipe_id}")
def delete_recipe(recipe_id: int, db: Session = Depends(get_db)):
    db_recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()
    if db_recipe is None:
        raise HTTPException(status_code=404, detail="Recipe not found!")
    db.delete(db_recipe)
    db.commit()
    return {"message": "Recipe successfully deleted!"}


@app.put("/recipes/{recipe_id}", response_model=schemas.Recipe)
def update_recipe(recipe_id: int, recipe: schemas.RecipeCreate, db: Session = Depends(get_db)):
    db_recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()
    if db_recipe is None:
        raise HTTPException(status_code=404, detail="Recipe not found!")

    db_recipe.name = recipe.name
    db_recipe.ingredient_str = recipe.ingredient_str
    db_recipe.instructions = recipe.instructions

    db.commit()
    db.refresh(db_recipe)
    return db_recipe


# --- INGREDIENT ENDPOINTS ---

@app.post("/ingredients/", response_model=schemas.Ingredient)
def create_ingredient(ingredient: schemas.IngredientCreate, db: Session = Depends(get_db)):
    db_ingredient = models.Ingredient(
        name=ingredient.name,
        category=ingredient.category,
        default_unit=ingredient.default_unit
    )
    db.add(db_ingredient)
    db.commit()
    db.refresh(db_ingredient)
    return db_ingredient


@app.get("/ingredients/", response_model=List[schemas.Ingredient])
def read_ingredients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    ingredients = db.query(models.Ingredient).offset(skip).limit(limit).all()
    return ingredients


# --- AI ENDPOINTS (SEVVAL & KEREM) ---

@app.post("/ai-recommend/")
def get_ai_recommendation(user_ingredients: List[str]):
    try:
        w2v = ai_model['w2v_model']
        tfidf_v = ai_model['tfidf_vectorizer']
        tfidf_m = ai_model['tfidf_matrix']
        r_vecs = ai_model['recipe_vectors_norm']
        df = ai_model['df']

        user_ings = [i.lower().strip() for i in user_ingredients]

        vecs = [w2v.wv[i] for i in user_ings if i in w2v.wv]
        if vecs:
            u_w2v = normalize(np.mean(vecs, axis=0).reshape(1, -1))
            s_w2v = cosine_similarity(u_w2v, r_vecs).flatten()
        else:
            s_w2v = np.zeros(len(df))

        u_tfidf = tfidf_v.transform([' '.join(user_ings)])
        s_tfidf = cosine_similarity(u_tfidf, tfidf_m).flatten()

        scores = 0.4 * s_w2v + 0.6 * s_tfidf
        top_idx = scores.argsort()[::-1][:10]

        return [
            {
                "id": int(idx),
                "name": df['recipe_name'].iloc[idx],
                "ingredient_str": df['ingredient_str'].iloc[idx],
                "instructions": df['instructions'].iloc[idx],
                "score": round(float(scores[idx]), 3)
            }
            for idx in top_idx
        ]
    except Exception as e:
        return []

@app.post("/predict")
def predict_spoilage(item: FoodItem):
    # --- TÜRKÇE - İNGİLİZCE ÇEVİRİ SÖZLÜĞÜ (MAPPING) ---
    category_mapping = {
        "Sıvı Süt Ürünleri": "Liquid_Dairy",
        "Fermente Süt Ürünleri": "Fermented_Dairy",
        "Sert Peynir": "Hard_Cheese",
        "Et ve Tavuk": "Meat_Poultry",
        "Sebzeler": "Vegetables",
        "Meyveler": "Fruits",
        "Pişmiş Yemekler": "Cooked_Meals"
    }
    english_category = category_mapping.get(item.Category, item.Category)

    features = {
        'Temperature_C': [item.Temperature_C],
        'Is_Package_Open': [item.Is_Package_Open],
        'Category_Cooked_Meals': [0],
        'Category_Fermented_Dairy': [0],
        'Category_Fruits': [0],
        'Category_Hard_Cheese': [0],
        'Category_Liquid_Dairy': [0],
        'Category_Meat_Poultry': [0],
        'Category_Vegetables': [0]
    }
    category_column = f"Category_{english_category}"
    if category_column in features:
        features[category_column] = [1]

    df = pd.DataFrame(features)

    prediction_raw = spoilage_model.predict(df)[0]

    final_days = max(1, int(round(float(prediction_raw))))

    return {
        "status": "success",
        "input_category": item.Category,
        "predicted_days_left": final_days
    }