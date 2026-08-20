package com.example.demo.dashboard.dto;

import com.example.demo.nutrition.dto.MealResponse;
import java.math.BigDecimal;
import java.util.List;

public record DashboardResponse(
        BigDecimal currentWeightKg,
        BigDecimal caloriesConsumed, BigDecimal caloriesTarget,
        BigDecimal proteinConsumed, BigDecimal proteinTarget,
        BigDecimal carbsConsumed, BigDecimal carbsTarget,
        BigDecimal fatConsumed, BigDecimal fatTarget,
        int waterConsumedMl, Integer waterTargetMl,
        MacroBreakdown macroBreakdown,
        TodaysWorkoutSummary todaysWorkout,
        int weeklyConsistency,
        List<Integer> weeklyScores,
        int workoutStreak,
        int dailyScore,
        List<MealResponse> recentMeals,
        List<RecentWorkoutSummary> recentWorkouts
) {}
