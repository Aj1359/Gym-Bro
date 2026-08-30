package com.example.demo.notification;

import com.example.demo.notification.event.WorkoutCompletedEvent;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
public class WorkoutEventProducer {

    private static final String TOPIC = "workout-completed";

    private final KafkaTemplate<String, WorkoutCompletedEvent> kafkaTemplate;

    public WorkoutEventProducer(KafkaTemplate<String, WorkoutCompletedEvent> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publishWorkoutCompleted(WorkoutCompletedEvent event) {
        kafkaTemplate.send(TOPIC, event.userId().toString(), event);
    }
}
