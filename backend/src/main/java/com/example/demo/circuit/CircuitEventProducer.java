package com.example.demo.circuit;

import com.example.demo.circuit.event.CircuitCompletedEvent;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

@Component
public class CircuitEventProducer {

    private final ApplicationEventPublisher publisher;

    public CircuitEventProducer(ApplicationEventPublisher publisher) {
        this.publisher = publisher;
    }

    public void publishCircuitCompleted(CircuitCompletedEvent event) {
        publisher.publishEvent(event);
    }
}
