package com.example.demo.workout.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.UUID;

public record LogSetRequest(
        @NotNull UUID exerciseId,
        @NotNull @Min(1) Integer setNumber,
        @DecimalMin("0.0") BigDecimal weightKg,
        @NotNull @Min(1) @Max(100) Integer reps,
        @DecimalMin("1.0") @DecimalMax("10.0") BigDecimal rpe
) {}
