CREATE TABLE processed_events (
    event_id UUID NOT NULL,
    consumer_name VARCHAR(100) NOT NULL,
    processed_at TIMESTAMP NOT NULL DEFAULT now(),
    PRIMARY KEY (event_id, consumer_name)
);
