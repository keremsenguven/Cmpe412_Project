import pandas as pd
import requests

API_URL = "http://127.0.0.1:8000/recipes/"

print("Reading CSV file...")
df = pd.read_csv("recipes_clean.csv")

successful_inserts = 0

for index, row in df.iterrows():
    try:
        recipe_data = {
            "name": str(row['recipe_name']),
            "ingredient_str": str(row['ingredient_str']),
            "instructions": str(row['instructions'])
        }

        response = requests.post(API_URL, json=recipe_data)

        if response.status_code == 200:
            successful_inserts += 1

    except Exception as e:
        print(f"Error at index {index}: {e}")

print(f"Process completed! Successfully inserted {successful_inserts} recipes.")