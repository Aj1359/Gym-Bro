package com.example.demo.nutrition.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record FoodResponse(
    UUID id,
    String name,
    String category,
    BigDecimal servingSize,
    String servingUnit,
    BigDecimal calories,
    BigDecimal proteinG,
    BigDecimal carbsG,
    BigDecimal fatG,
    BigDecimal fiberG
) {}
