package com.example.demo.workout.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record TemplateExerciseResponse(
        UUID id, UUID exerciseId, String exerciseName, String imageUrl,
        List<String> instructions, Integer targetSets, Integer targetReps, BigDecimal targetWeightKg
) {}
