package com.example.demo.dashboard.dto;

import java.math.BigDecimal;

public record DashboardResponse(
        BigDecimal currentWeightKg,
        BigDecimal caloriesConsumed, BigDecimal caloriesTarget,
        BigDecimal proteinConsumed, BigDecimal proteinTarget,
        int waterConsumedMl, Integer waterTargetMl,
        TodaysWorkoutSummary todaysWorkout,
        int weeklyConsistency,
        int workoutStreak
) {}
