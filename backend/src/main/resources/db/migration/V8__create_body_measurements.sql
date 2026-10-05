CREATE TABLE body_measurements (
    id UUID DEFAULT random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    weight_kg NUMERIC(5,2),
    body_fat_pct NUMERIC(4,1),
    chest_cm NUMERIC(5,1),
    waist_cm NUMERIC(5,1),
    arms_cm NUMERIC(5,1),
    neck_cm NUMERIC(5,1),
    thigh_cm NUMERIC(5,1),
    calves_cm NUMERIC(5,1),
    logged_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_body_measurements_user_logged ON body_measurements(user_id, logged_at);
