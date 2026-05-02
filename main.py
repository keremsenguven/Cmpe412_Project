from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
import models, schemas
from database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)
app = FastAPI()

#Database connection
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def root():
    return {"message": "Inventory API is live"}

#adding ingredients (Create)
@app.post("/ingredients/", response_model=schemas.IngredientResponse)
def create_ingredient(ingredient: schemas.IngredientCreate, db: Session = Depends(get_db)):
    db_ingredient = models.Ingredient(name=ingredient.name, category_id=ingredient.category_id)
    db.add(db_ingredient)
    db.commit()
    db.refresh(db_ingredient)
    return db_ingredient

#listing ingredients (Read)
@app.get("/ingredients/")
def get_ingredients(db: Session = Depends(get_db)):
    return db.query(models.Ingredient).all()