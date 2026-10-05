package com.example.demo.notification;

import com.example.demo.notification.event.WorkoutCompletedEvent;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

@Component
public class WorkoutEventProducer {

    private final ApplicationEventPublisher publisher;

    public WorkoutEventProducer(ApplicationEventPublisher publisher) {
        this.publisher = publisher;
    }

    public void publishWorkoutCompleted(WorkoutCompletedEvent event) {
        publisher.publishEvent(event);
    }
}
