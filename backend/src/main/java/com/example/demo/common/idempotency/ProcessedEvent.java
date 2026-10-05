package com.example.demo.common.idempotency;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "processed_events")
public class ProcessedEvent {

    @Id
    private UUID eventId;
    
    private String consumerName;
    
    private LocalDateTime processedAt = LocalDateTime.now();

    protected ProcessedEvent() {}

    public ProcessedEvent(UUID eventId, String consumerName) {
        this.eventId = eventId;
        this.consumerName = consumerName;
    }

    public UUID getEventId() { return eventId; }
    public String getConsumerName() { return consumerName; }
    public LocalDateTime getProcessedAt() { return processedAt; }
}
