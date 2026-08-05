package com.example.demo.nutrition.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record DailyNutritionSummary(
        BigDecimal totalCalories, BigDecimal totalProtein, BigDecimal totalCarbs,
        BigDecimal totalFat, BigDecimal totalFiber, int totalWaterMl,
        Map<String, List<MealResponse>> mealsByType
) {}
