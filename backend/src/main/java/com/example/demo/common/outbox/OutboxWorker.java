package com.example.demo.common.outbox;

import com.example.demo.circuit.event.CircuitCompletedEvent;
import com.example.demo.notification.event.WorkoutCompletedEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
public class OutboxWorker {

    private static final Logger log = LoggerFactory.getLogger(OutboxWorker.class);

    private final OutboxEventRepository repository;
    private final ApplicationEventPublisher publisher;
    private final ObjectMapper objectMapper;

    public OutboxWorker(OutboxEventRepository repository, ApplicationEventPublisher publisher, ObjectMapper objectMapper) {
        this.repository = repository;
        this.publisher = publisher;
        this.objectMapper = objectMapper;
    }

    @Scheduled(fixedDelay = 5000)
    @Transactional
    public void processOutbox() {
        List<OutboxEvent> events = repository.findUnprocessedEvents();
        if (events.isEmpty()) return;

        log.info("Processing {} outbox events...", events.size());

        for (OutboxEvent event : events) {
            try {
                if ("WorkoutCompletedEvent".equals(event.getEventType())) {
                    WorkoutCompletedEvent payload = objectMapper.readValue(event.getPayload(), WorkoutCompletedEvent.class);
                    publisher.publishEvent(payload);
                } else if ("CircuitCompletedEvent".equals(event.getEventType())) {
                    CircuitCompletedEvent payload = objectMapper.readValue(event.getPayload(), CircuitCompletedEvent.class);
                    publisher.publishEvent(payload);
                }
                
                event.markProcessed();
                repository.save(event);
            } catch (Exception e) {
                log.error("Failed to process outbox event: {}", event.getId(), e);
                // Optionally implement retry logic or DLQ
            }
        }
    }
}
