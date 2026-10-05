package com.example.demo.notification;

import com.example.demo.notification.event.WorkoutCompletedEvent;
import com.example.demo.common.idempotency.ProcessedEvent;
import com.example.demo.common.idempotency.ProcessedEventRepository;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Component
public class WorkoutEventConsumer {

    private final NotificationService notificationService;
    private final ProcessedEventRepository processedEventRepository;

    public WorkoutEventConsumer(NotificationService notificationService, ProcessedEventRepository processedEventRepository) {
        this.notificationService = notificationService;
        this.processedEventRepository = processedEventRepository;
    }

    @EventListener
    @Transactional
    public void handleWorkoutCompleted(WorkoutCompletedEvent event) {
        UUID eventId = event.workoutId(); // In a real system, the Event itself should have a unique ID, but we can use workoutId for now as a simplistic idempotency key for this specific event type.
        
        if (processedEventRepository.existsByEventIdAndConsumerName(eventId, "WorkoutEventConsumer")) {
            return; // Event already processed
        }

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
        
        processedEventRepository.save(new ProcessedEvent(eventId, "WorkoutEventConsumer"));
    }
}
