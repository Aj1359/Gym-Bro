CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    force VARCHAR(30),
    level VARCHAR(30) NOT NULL,
    mechanic VARCHAR(30),
    equipment VARCHAR(50),
    primary_muscles TEXT[] NOT NULL,
    secondary_muscles TEXT[],
    instructions TEXT[] NOT NULL,
    category VARCHAR(30) NOT NULL,
    images TEXT[]
);

-- GIN index for array containment queries: WHERE 'chest' = ANY(primary_muscles)
CREATE INDEX idx_exercises_primary_muscles ON exercises USING GIN (primary_muscles);

-- B-tree for equipment equality filtering: WHERE equipment = 'barbell'
CREATE INDEX idx_exercises_equipment ON exercises(equipment);

-- Full-text search on name: 'bench' matches 'Barbell Bench Press'
CREATE INDEX idx_exercises_name ON exercises USING GIN (to_tsvector('english', name));
