package com.example.demo.nutrition.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.UUID;

public record LogMealRequest(
        @NotNull UUID foodId,
        @NotNull @Pattern(regexp = "breakfast|lunch|dinner|snack", message = "Must be breakfast, lunch, dinner, or snack")
        String mealType,
        @NotNull @DecimalMin("0.1") BigDecimal quantity
) {}
