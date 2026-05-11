from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models, schemas
from database import SessionLocal, engine
import pandas as pd
import pickle
from pydantic import BaseModel
import xgboost as xgb

models.Base.metadata.create_all(bind=engine)
app = FastAPI()

spoilage_model = xgb.XGBRegressor()
spoilage_model.load_model('xgboost_spoilage_model.json')

recipes_df = pd.read_csv("recipes_clean.csv")

with open("recommendation_model_hybrid.pkl", "rb") as f:
    ai_model = pickle.load(f)



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
        # Combine user ingredients into a single string for Sevval's .pkl model
        ingredients_input = " ".join(user_ingredients)

        # Run the model to get recipe recommendations
        recommendations = ai_model.predict([ingredients_input])

        # Convert NumPy array to a standard Python list if necessary
        if hasattr(recommendations, 'tolist'):
            recommendations = recommendations.tolist()

        return {
            "status": "success",
            "recommended_recipes": recommendations
        }
    except Exception as e:
        # Prevent app crash and return an error message if the model fails
        return {
            "status": "error",
            "message": f"An error occurred while running the recommendation model: {str(e)}",
            "received_ingredients": user_ingredients
        }


@app.post("/predict")
def predict_spoilage(item: FoodItem):
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

    category_column = f"Category_{item.Category}"
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