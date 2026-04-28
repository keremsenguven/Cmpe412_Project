USE smart_kitchen_db;

-- USERS
INSERT INTO users (username, email, password_hash)
VALUES 
('mustafa', 'mustafa@example.com', 'hashed_pw_1'),
('demo_user', 'demo@example.com', 'hashed_pw_2');

-- INGREDIENTS
INSERT INTO ingredients (name, category, default_unit)
VALUES
('domates', 'sebze', 'kg'),
('yumurta', 'hayvansal', 'adet'),
('biber', 'sebze', 'adet'),
('süt', 'süt ürünü', 'litre'),
('tavuk', 'et', 'kg');

-- STORAGE LOCATIONS
INSERT INTO storage_locations (name, avg_temperature)
VALUES
('buzdolabı', 4),
('oda sıcaklığı', 22),
('dondurucu', -18);

-- USER INVENTORY
INSERT INTO user_inventory (user_id, ingredient_id, quantity, unit, storage_location_id, is_opened)
VALUES
(1, 1, 2.0, 'kg', 1, false),   -- domates
(1, 2, 6, 'adet', 1, false),   -- yumurta
(1, 3, 3, 'adet', 2, true);    -- biber

-- RECIPES
INSERT INTO recipes (name, instructions)
VALUES
('Menemen', 'Domates, biber ve yumurtayı pişir.'),
('Tavuk Sote', 'Tavuk ve sebzeleri kavur.');

-- RECIPE INGREDIENTS
INSERT INTO recipe_ingredients (recipe_id, ingredient_name)
VALUES
(1, 'domates'),
(1, 'yumurta'),
(1, 'biber'),
(2, 'tavuk'),
(2, 'biber');

-- SPOILAGE PREDICTIONS
INSERT INTO spoilage_predictions (inventory_id, predicted_days, model_name, confidence_score)
VALUES
(1, 5, 'xgboost_v1', 0.87),
(2, 10, 'xgboost_v1', 0.91);