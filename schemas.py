from pydantic import BaseModel
from typing import Optional

class IngredientCreate(BaseModel):
    name: str
    category_id: int

class IngredientResponse(IngredientCreate):
    id: int
    class Config:
        from_attributes = True