CREATE DATABASE IF NOT EXISTS smart_kitchen_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE smart_kitchen_db;

-- Drop (temiz kurulum için)
DROP TABLE IF EXISTS spoilage_predictions;
DROP TABLE IF EXISTS recipe_ingredients;
DROP TABLE IF EXISTS user_inventory;
DROP TABLE IF EXISTS recipes;
DROP TABLE IF EXISTS storage_locations;
DROP TABLE IF EXISTS ingredients;
DROP TABLE IF EXISTS users;

-- USERS
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- INGREDIENTS
CREATE TABLE ingredients (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(100),
    default_unit VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- STORAGE LOCATIONS
CREATE TABLE storage_locations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    avg_temperature FLOAT
);

-- USER INVENTORY
CREATE TABLE user_inventory (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    ingredient_id BIGINT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit VARCHAR(30) NOT NULL,
    storage_location_id BIGINT,
    is_opened BOOLEAN DEFAULT FALSE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiry_date DATE,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE,
    FOREIGN KEY (storage_location_id) REFERENCES storage_locations(id)
);

-- RECIPES
CREATE TABLE recipes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RECIPE INGREDIENTS (AI için text)
CREATE TABLE recipe_ingredients (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipe_id BIGINT NOT NULL,
    ingredient_name VARCHAR(100) NOT NULL,

    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

-- SPOILAGE PREDICTIONS
CREATE TABLE spoilage_predictions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    inventory_id BIGINT NOT NULL,
    predicted_days INT NOT NULL,
    model_name VARCHAR(100),
    confidence_score FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (inventory_id) REFERENCES user_inventory(id) ON DELETE CASCADE
);

-- INDEXLER (performans)
CREATE INDEX idx_inventory_user ON user_inventory(user_id);
CREATE INDEX idx_inventory_ingredient ON user_inventory(ingredient_id);
CREATE INDEX idx_recipe_ingredient_name ON recipe_ingredients(ingredient_name);
CREATE INDEX idx_predictions_inventory ON spoilage_predictions(inventory_id);