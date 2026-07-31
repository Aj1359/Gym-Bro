package com.example.demo.workout.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.UUID;

public record AddTemplateExerciseRequest(
        @NotNull UUID exerciseId,
        @NotNull @Min(1) @Max(10) Integer targetSets,
        @NotNull @Min(1) @Max(100) Integer targetReps,
        BigDecimal targetWeightKg
) {}
