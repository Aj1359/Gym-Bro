CREATE TABLE workout_day_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE workout_day_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES workout_day_templates(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(id),
    order_index INT NOT NULL DEFAULT 0,
    target_sets INT NOT NULL DEFAULT 3,
    target_reps INT NOT NULL DEFAULT 10,
    target_weight_kg NUMERIC(6,2)
);

ALTER TABLE workouts ADD COLUMN template_id UUID REFERENCES workout_day_templates(id) ON DELETE SET NULL;

CREATE INDEX idx_workout_day_templates_user_id ON workout_day_templates(user_id);
CREATE INDEX idx_workout_day_exercises_template_id ON workout_day_exercises(template_id);
