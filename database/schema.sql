CREATE DATABASE IF NOT EXISTS smart_kitchen_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE smart_kitchen_db;

-- Drop tables in dependency order
DROP TABLE IF EXISTS spoilage_predictions;
DROP TABLE IF EXISTS user_inventory;
DROP TABLE IF EXISTS recipes;
DROP TABLE IF EXISTS storage_locations;
DROP TABLE IF EXISTS ingredients;
DROP TABLE IF EXISTS users;

-- USERS
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- INGREDIENTS
CREATE TABLE ingredients (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category ENUM(
        'Liquid_Dairy',
        'Fermented_Dairy',
        'Hard_Cheese',
        'Meat_Poultry',
        'Vegetables',
        'Fruits',
        'Cooked_Meals'
    ) NOT NULL,
    default_unit VARCHAR(30),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- STORAGE LOCATIONS
CREATE TABLE storage_locations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
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
    is_opened BOOLEAN NOT NULL DEFAULT FALSE,
    added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expiry_date DATE,

    CONSTRAINT chk_inventory_quantity_positive
        CHECK (quantity > 0),

    CONSTRAINT fk_inventory_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_inventory_ingredient
        FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_inventory_storage_location
        FOREIGN KEY (storage_location_id) REFERENCES storage_locations(id)
        ON DELETE SET NULL
);

-- RECIPES
CREATE TABLE recipes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    ingredient_str TEXT NOT NULL,
    instructions TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- SPOILAGE PREDICTIONS
CREATE TABLE spoilage_predictions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    inventory_id BIGINT NOT NULL,
    predicted_days INT NOT NULL,
    model_name VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_predicted_days_non_negative
        CHECK (predicted_days >= 0),

    CONSTRAINT fk_prediction_inventory
        FOREIGN KEY (inventory_id) REFERENCES user_inventory(id)
        ON DELETE CASCADE
);

-- INDEXES
CREATE INDEX idx_inventory_user ON user_inventory(user_id);
CREATE INDEX idx_inventory_ingredient ON user_inventory(ingredient_id);
CREATE INDEX idx_inventory_storage ON user_inventory(storage_location_id);
CREATE INDEX idx_ingredients_category ON ingredients(category);
CREATE INDEX idx_predictions_inventory ON spoilage_predictions(inventory_id);