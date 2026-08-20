package com.example.demo.dashboard.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record RecentWorkoutSummary(UUID id, String title, LocalDateTime startedAt, Long durationMinutes) {}
