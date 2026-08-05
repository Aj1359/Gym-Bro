CREATE TABLE favorite_foods (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    food_id UUID NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, food_id)
);

CREATE TABLE water_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount_ml INT NOT NULL,
    logged_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_water_logs_user_logged ON water_logs(user_id, logged_at);
