package com.example.demo.notification;

import com.example.demo.notification.event.WorkoutCompletedEvent;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class WorkoutEventConsumer {

    private final NotificationService notificationService;

    public WorkoutEventConsumer(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @KafkaListener(topics = "workout-completed", groupId = "gymbro-backend")
    public void handleWorkoutCompleted(WorkoutCompletedEvent event) {
        String title;
        String body;

        if (event.prCount() > 0) {
            title = "New Personal Record! 🎉";
            body = String.format("You hit %d PR%s in \"%s\" — great work!",
                    event.prCount(), event.prCount() > 1 ? "s" : "", event.workoutTitle());
        } else {
            title = "Workout Complete";
            body = String.format("You finished \"%s\" with %skg total volume. Nice consistency!",
                    event.workoutTitle(), event.totalVolume());
        }

        notificationService.createNotification(event.userId(), title, body, "workout_completed");
    }
}
