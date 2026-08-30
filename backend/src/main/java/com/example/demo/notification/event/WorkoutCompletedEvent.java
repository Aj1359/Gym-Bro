package com.example.demo.notification.event;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record WorkoutCompletedEvent(
        UUID workoutId, UUID userId, String workoutTitle,
        BigDecimal totalVolume, int prCount, LocalDateTime completedAt
) {}
