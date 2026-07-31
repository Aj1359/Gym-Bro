package com.example.demo.workout.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record WorkoutSetResponse(
        UUID id, UUID exerciseId, Integer setNumber,
        BigDecimal weightKg, Integer reps, BigDecimal rpe,
        BigDecimal estimatedOneRepMax, boolean isPersonalRecord
) {}
