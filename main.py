from fastapi import FastAPI
from pydantic import BaseModel
import xgboost as xgb
import pandas as pd

# 1. Initialize FastAPI app
app = FastAPI(
    title="Smart Kitchen AI API",
    description="Predicts food spoilage days using XGBoost",
    version="1.0"
)

# 2. Load the newly trained XGBoost model into memory
model = xgb.XGBRegressor()
model.load_model('xgboost_spoilage_model.json')


# 3. Define the updated Data Schema (What Frontend will send)
class FoodItem(BaseModel):
    Category: str  # Must be: 'Liquid_Dairy', 'Fermented_Dairy', 'Hard_Cheese', 'Meat_Poultry', 'Vegetables', 'Fruits', or 'Cooked_Meals'
    Temperature_C: float
    Is_Package_Open: int  # 0 for closed, 1 for open


# 4. Create the Prediction Endpoint
@app.post("/predict")
def predict_spoilage(item: FoodItem):
    # Pre-fill ALL new categorical features with 0 (Simulating One-Hot Encoding)
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

    # Dynamically set the selected category to 1
    category_column = f"Category_{item.Category}"
    if category_column in features:
        features[category_column] = [1]

    # Convert dictionary to Pandas DataFrame
    # Note: Column order must exactly match the columns used during training
    df = pd.DataFrame(features)

    # 5. Make the Prediction
    prediction_raw = model.predict(df)[0]

    # Ensure prediction doesn't fall below 1 day and round it
    final_days = max(1, int(round(float(prediction_raw))))

    return {
        "status": "success",
        "input_category": item.Category,
        "predicted_days_left": final_days
    }