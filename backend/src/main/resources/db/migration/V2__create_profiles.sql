CREATE TABLE profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    age INT NOT NULL,
    height_cm NUMERIC(5,2) NOT NULL,
    weight_kg NUMERIC(5,2) NOT NULL,
    gender VARCHAR(20) NOT NULL,
    goal VARCHAR(30) NOT NULL,
    activity_level VARCHAR(30) NOT NULL,
    experience_level VARCHAR(20) NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);
