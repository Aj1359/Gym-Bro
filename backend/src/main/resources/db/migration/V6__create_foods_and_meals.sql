CREATE TABLE foods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    serving_size NUMERIC(6,1) NOT NULL,
    serving_unit VARCHAR(20) NOT NULL,
    calories NUMERIC(6,1) NOT NULL,
    protein_g NUMERIC(5,1) NOT NULL,
    carbs_g NUMERIC(5,1) NOT NULL,
    fat_g NUMERIC(5,1) NOT NULL,
    fiber_g NUMERIC(5,1) NOT NULL DEFAULT 0
);

CREATE INDEX idx_foods_name ON foods USING GIN (to_tsvector('english', name));
CREATE INDEX idx_foods_category ON foods(category);

CREATE TABLE meals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    food_id UUID NOT NULL REFERENCES foods(id),
    meal_type VARCHAR(20) NOT NULL,
    quantity NUMERIC(6,1) NOT NULL,
    logged_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_meals_user_id ON meals(user_id);
CREATE INDEX idx_meals_logged_at ON meals(logged_at);

-- Seed data: all nutrition values per the stated serving_size/serving_unit
INSERT INTO foods (name, category, serving_size, serving_unit, calories, protein_g, carbs_g, fat_g, fiber_g) VALUES
-- Grains & staples
('Roti (whole wheat)', 'grains', 1, 'piece', 120, 3.0, 18.0, 3.5, 2.5),
('White Rice (cooked)', 'grains', 100, 'g', 130, 2.7, 28.0, 0.3, 0.4),
('Brown Rice (cooked)', 'grains', 100, 'g', 112, 2.6, 23.5, 0.9, 1.8),
('Oats (dry)', 'grains', 40, 'g', 152, 5.3, 27.0, 2.8, 4.1),
('Poha (flattened rice, cooked)', 'grains', 100, 'g', 130, 2.5, 27.0, 1.0, 1.0),
('White Bread', 'grains', 1, 'slice', 79, 2.7, 14.0, 1.0, 0.8),

-- Legumes & dal
('Dal (cooked, average)', 'legumes', 100, 'g', 116, 7.0, 20.0, 0.4, 5.0),
('Chana (chickpeas, cooked)', 'legumes', 100, 'g', 164, 8.9, 27.4, 2.6, 7.6),
('Rajma (kidney beans, cooked)', 'legumes', 100, 'g', 127, 8.7, 22.8, 0.5, 6.4),
('Soya Chunks (cooked)', 'legumes', 100, 'g', 345, 52.0, 33.0, 0.5, 13.0),

-- Dairy & eggs
('Milk (whole)', 'dairy', 250, 'ml', 150, 8.0, 12.0, 8.0, 0),
('Curd/Yogurt (plain)', 'dairy', 100, 'g', 60, 3.5, 4.7, 3.3, 0),
('Paneer', 'dairy', 100, 'g', 265, 18.3, 1.2, 20.8, 0),
('Large Egg (boiled)', 'dairy', 1, 'piece', 78, 6.3, 0.6, 5.3, 0),
('Egg Whites', 'dairy', 1, 'piece', 17, 3.6, 0.2, 0.1, 0),

-- Meat & fish
('Chicken Breast (cooked)', 'meat', 100, 'g', 165, 31.0, 0, 3.6, 0),
('Chicken Thigh (cooked)', 'meat', 100, 'g', 209, 26.0, 0, 10.9, 0),
('Fish (Rohu, cooked)', 'meat', 100, 'g', 97, 16.6, 0, 3.0, 0),
('Mutton (cooked)', 'meat', 100, 'g', 250, 25.0, 0, 16.0, 0),

-- Fruits
('Banana', 'fruits', 1, 'piece', 105, 1.3, 27.0, 0.4, 3.1),
('Apple', 'fruits', 1, 'piece', 95, 0.5, 25.0, 0.3, 4.4),
('Mango', 'fruits', 100, 'g', 60, 0.8, 15.0, 0.4, 1.6),
('Orange', 'fruits', 1, 'piece', 62, 1.2, 15.4, 0.2, 3.1),

-- Vegetables
('Potato (boiled)', 'vegetables', 100, 'g', 87, 1.9, 20.1, 0.1, 1.8),
('Spinach (cooked)', 'vegetables', 100, 'g', 23, 2.9, 3.6, 0.4, 2.2),
('Broccoli (cooked)', 'vegetables', 100, 'g', 35, 2.4, 7.2, 0.4, 3.3),
('Mixed Vegetable Sabzi', 'vegetables', 100, 'g', 90, 2.5, 12.0, 3.5, 2.8),

-- Snacks / processed
('Samosa', 'snacks', 1, 'piece', 262, 3.5, 24.0, 17.0, 1.5),
('Burger (fast food)', 'snacks', 1, 'piece', 550, 25.0, 45.0, 30.0, 2.0),
('Biscuits (plain)', 'snacks', 2, 'piece', 90, 1.5, 15.0, 3.0, 0.5),
('Potato Chips', 'snacks', 30, 'g', 160, 2.0, 15.0, 10.0, 1.0),

-- Nuts & fats
('Almonds', 'nuts', 30, 'g', 174, 6.4, 6.1, 15.0, 3.7),
('Peanut Butter', 'nuts', 15, 'g', 94, 3.6, 3.1, 8.1, 0.9),
('Cooking Oil (any)', 'fats', 5, 'ml', 44, 0, 0, 5.0, 0),
('Ghee', 'fats', 5, 'g', 45, 0, 0, 5.0, 0);