from pydantic import BaseModel
from typing import Optional, List

#ingredient schemas
class IngredientBase(BaseModel):
    name: str

class IngredientCreate(IngredientBase):
    pass

class Ingredient(IngredientBase):
    id: int
    category_id: Optional[int] = None

    class Config:
        from_attributes = True

#recipe schemas
class RecipeBase(BaseModel):
    title: str
    description: Optional[str] = None

class RecipeCreate(RecipeBase):
    pass

class Recipe(RecipeBase):
    id: int
    #bu satır sayesinde tarifin içindeki malzemeleri de görebileceğiz
    ingredients: List[Ingredient] = []

    class Config:
        from_attributes = True