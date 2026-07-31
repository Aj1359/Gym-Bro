package com.example.demo.workout.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record WorkoutResponse(
        UUID id, String title, LocalDateTime startedAt, LocalDateTime completedAt,
        List<WorkoutSetResponse> sets, List<TemplateExerciseResponse> plannedExercises,
        BigDecimal totalVolume
) {}
