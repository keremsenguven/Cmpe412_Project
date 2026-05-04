USE smart_kitchen_db;

INSERT INTO users (username, email, password_hash)
VALUES 
('mustafa', 'mustafa@example.com', 'hashed_pw_1'),
('demo_user', 'demo@example.com', 'hashed_pw_2');

INSERT INTO ingredients (name, category, default_unit)
VALUES
('milk', 'Liquid_Dairy', 'liter'),
('yogurt', 'Fermented_Dairy', 'kg'),
('cheddar cheese', 'Hard_Cheese', 'kg'),
('chicken breast', 'Meat_Poultry', 'kg'),
('tomato', 'Vegetables', 'kg'),
('apple', 'Fruits', 'kg'),
('rice with chicken', 'Cooked_Meals', 'portion');

INSERT INTO storage_locations (name, avg_temperature)
VALUES
('refrigerator', 4),
('room temperature', 22),
('freezer', -18);

INSERT INTO user_inventory 
(user_id, ingredient_id, quantity, unit, storage_location_id, is_opened, expiry_date)
VALUES
(1, 1, 1.00, 'liter', 1, true, '2026-05-05'),
(1, 4, 0.75, 'kg', 1, false, '2026-05-04'),
(1, 5, 2.00, 'kg', 2, false, '2026-05-07'),
(1, 7, 1.00, 'portion', 1, true, '2026-05-03');

INSERT INTO recipes (name, ingredient_str, instructions)
VALUES
('Chicken Tomato Saute', 
 'chicken breast, tomato, onion, pepper, oil, salt', 
 'Cook chicken with vegetables until tender.'),

('Fruit Yogurt Bowl', 
 'yogurt, apple, honey, oats', 
 'Mix yogurt with sliced apple, honey and oats.'),

('Cheese Omelette', 
 'egg, cheddar cheese, milk, butter, salt', 
 'Whisk eggs with milk, add cheese and cook in a pan.');

INSERT INTO spoilage_predictions (inventory_id, predicted_days, model_name)
VALUES
(1, 3, 'xgboost_v1'),
(2, 2, 'xgboost_v1'),
(3, 5, 'xgboost_v1'),
(4, 1, 'xgboost_v1');