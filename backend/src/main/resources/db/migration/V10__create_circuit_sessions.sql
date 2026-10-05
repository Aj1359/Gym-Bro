CREATE TABLE circuit_sessions (
    id UUID DEFAULT random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    overall_notes VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'planned',
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE circuit_stations (
    id UUID DEFAULT random_uuid() PRIMARY KEY,
    circuit_session_id UUID NOT NULL REFERENCES circuit_sessions(id) ON DELETE CASCADE,
    station_name VARCHAR(150) NOT NULL,
    order_index INT NOT NULL,
    planned_type VARCHAR(10) NOT NULL CONSTRAINT chk_planned_type CHECK (planned_type IN ('time', 'reps')),
    planned_target INT NOT NULL,
    planned_rest_seconds INT NOT NULL DEFAULT 0,
    actual_value INT,
    actual_notes VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE circuit_ai_reports (
    circuit_session_id UUID PRIMARY KEY REFERENCES circuit_sessions(id) ON DELETE CASCADE,
    plan_quality_score INT NOT NULL,
    adherence_score INT NOT NULL,
    overall_score INT NOT NULL,
    summary_feedback VARCHAR(1000) NOT NULL,
    generated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_circuit_sessions_user_date ON circuit_sessions(user_id, session_date);
CREATE INDEX idx_circuit_stations_session ON circuit_stations(circuit_session_id, order_index);
