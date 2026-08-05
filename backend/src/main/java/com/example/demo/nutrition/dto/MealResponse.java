package com.example.demo.nutrition.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record MealResponse(
        UUID id, String foodName, String mealType, BigDecimal quantity, String servingUnit,
        BigDecimal calories, BigDecimal proteinG, BigDecimal carbsG, BigDecimal fatG, BigDecimal fiberG,
        LocalDateTime loggedAt
) {}
