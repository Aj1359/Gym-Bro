package com.example.demo.profile.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

/**
 * Incoming request body for PUT /profile.
 *
 * Validation bounds are not cosmetic — this data feeds directly into calorie math.
 * A typo (e.g. weight 700 instead of 70) would produce dangerously wrong TDEE values.
 */
public record ProfileRequest(
        @NotNull @Min(13) @Max(100)
        Integer age,

        @NotNull @DecimalMin("50.0") @DecimalMax("250.0")
        BigDecimal heightCm,

        @NotNull @DecimalMin("20.0") @DecimalMax("400.0")
        BigDecimal weightKg,

        @NotBlank
        String gender,

        @NotBlank
        String goal,

        @NotBlank
        String activityLevel,

        @NotBlank
        String experienceLevel
) {}
