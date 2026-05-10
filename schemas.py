from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum

# --- ENUMS ---
class IngredientCategory(str, Enum):
    Liquid_Dairy = "Liquid_Dairy"
    Fermented_Dairy = "Fermented_Dairy"
    Hard_Cheese = "Hard_Cheese"
    Meat_Poultry = "Meat_Poultry"
    Vegetables = "Vegetables"
    Fruits = "Fruits"
    Cooked_Meals = "Cooked_Meals"


# --- INGREDIENT SCHEMAS ---
class IngredientBase(BaseModel):
    name: str
    category: IngredientCategory
    default_unit: Optional[str] = None

class IngredientCreate(IngredientBase):
    pass

class Ingredient(IngredientBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# --- RECIPE SCHEMAS ---
class RecipeBase(BaseModel):
    name: str
    ingredient_str: str
    instructions: str

class RecipeCreate(RecipeBase):
    pass

class Recipe(RecipeBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True