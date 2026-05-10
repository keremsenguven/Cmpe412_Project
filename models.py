from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Date, Numeric, Enum as SQLEnum, \
    Text
from sqlalchemy.sql import func
import enum
from database import Base


class IngredientCategory(enum.Enum):
    Liquid_Dairy = "Liquid_Dairy"
    Fermented_Dairy = "Fermented_Dairy"
    Hard_Cheese = "Hard_Cheese"
    Meat_Poultry = "Meat_Poultry"
    Vegetables = "Vegetables"
    Fruits = "Fruits"
    Cooked_Meals = "Cooked_Meals"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)


class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    category = Column(SQLEnum(IngredientCategory), nullable=False)
    default_unit = Column(String(30))
    created_at = Column(DateTime, default=func.now(), nullable=False)


class StorageLocation(Base):
    __tablename__ = "storage_locations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    avg_temperature = Column(Float)


class UserInventory(Base):
    __tablename__ = "user_inventory"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    ingredient_id = Column(Integer, ForeignKey("ingredients.id", ondelete="CASCADE"), nullable=False)
    quantity = Column(Numeric(10, 2), nullable=False)
    unit = Column(String(30), nullable=False)
    storage_location_id = Column(Integer, ForeignKey("storage_locations.id", ondelete="SET NULL"))
    is_opened = Column(Boolean, default=False, nullable=False)
    added_at = Column(DateTime, default=func.now(), nullable=False)
    expiry_date = Column(Date)


class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    ingredient_str = Column(Text, nullable=False)
    instructions = Column(Text, nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)


class SpoilagePrediction(Base):
    __tablename__ = "spoilage_predictions"

    id = Column(Integer, primary_key=True, index=True)
    inventory_id = Column(Integer, ForeignKey("user_inventory.id", ondelete="CASCADE"), nullable=False)
    predicted_days = Column(Integer, nullable=False)
    model_name = Column(String(100))
    created_at = Column(DateTime, default=func.now(), nullable=False)