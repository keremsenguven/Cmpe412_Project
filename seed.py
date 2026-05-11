import pandas as pd
import requests

API_URL = "http://127.0.0.1:8000/recipes/"

print("Loading CSV file...")
df = pd.read_csv("recipes_clean.csv")

successful_inserts = 0

for index, row in df.iterrows():
    try:
        recipe_data = {
            "name": str(row['recipe_name']),
            "ingredient_str": str(row['ingredient_str']),
            "instructions": str(row['instructions'])
        }

        # Send a POST request to add the recipe
        response = requests.post(API_URL, json=recipe_data)

        if response.status_code == 200:
            successful_inserts += 1
        else:
            print(f"Failed to insert row {index}. Status code: {response.status_code}")

    except Exception as e:
        print(f"Error occurred at row {index}: {e}")

print(f"Seeding completed! Successfully inserted {successful_inserts} recipes into the database.")