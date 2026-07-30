package com.example.demo.profile;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Pure calculation service — no database, no HTTP.
 * Computes BMI, BMR (Mifflin-St Jeor), TDEE, and macro targets from a Profile.
 *
 * Designed as an isolated, deterministic unit so it can be:
 *   1. Unit-tested without a database
 *   2. Swapped for an ML model prediction in Phase 2 while keeping the same interface
 */
@Service
public class GoalCalculationService {

    /**
     * Immutable value object carrying all computed targets.
     * Nested here because nothing outside this service needs to reference it independently.
     */
    public record GoalTargets(
            BigDecimal bmi,
            BigDecimal bmr,
            BigDecimal tdee,
            int calories,
            int proteinGrams,
            int carbsGrams,
            int fatGrams,
            int fibreGrams,
            BigDecimal waterLitres
    ) {}

    public GoalTargets calculate(Profile profile) {
        // Convert height from cm to m for BMI calculation
        BigDecimal heightM = profile.getHeightCm().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
        BigDecimal weightKg = profile.getWeightKg();

        // BMI = weight(kg) / height(m)²
        BigDecimal bmi = weightKg.divide(heightM.multiply(heightM), 1, RoundingMode.HALF_UP);

        // BMR via Mifflin-St Jeor (more accurate than Harris-Benedict)
        BigDecimal bmr = calculateBmr(profile);

        // TDEE = BMR × activity multiplier
        BigDecimal tdee = bmr.multiply(activityMultiplier(profile.getActivityLevel()));

        // Calorie target adjusted for goal (deficit/surplus)
        int calories = applyGoalAdjustment(tdee, profile.getGoal());

        // Protein: 2g per kg bodyweight (upper-range to support active users)
        int proteinGrams = weightKg.multiply(BigDecimal.valueOf(2))
                .setScale(0, RoundingMode.HALF_UP).intValue();

        // Fat: 25% of calories, at 9 kcal/g
        int fatGrams = BigDecimal.valueOf(calories)
                .multiply(BigDecimal.valueOf(0.25))
                .divide(BigDecimal.valueOf(9), 0, RoundingMode.HALF_UP)
                .intValue();

        // Carbs: remainder calories after protein + fat, at 4 kcal/g
        int proteinCalories = proteinGrams * 4;
        int fatCalories = fatGrams * 9;
        int carbsGrams = Math.max(0, (calories - proteinCalories - fatCalories) / 4);

        // Fibre: ~14g per 1000 kcal (FDA/USDA guideline, scaled to actual intake)
        int fibreGrams = BigDecimal.valueOf(calories)
                .divide(BigDecimal.valueOf(1000), 0, RoundingMode.HALF_UP)
                .intValue() * 14;

        // Water: 33 ml per kg bodyweight
        BigDecimal waterLitres = weightKg.multiply(BigDecimal.valueOf(0.033))
                .setScale(1, RoundingMode.HALF_UP);

        return new GoalTargets(
                bmi,
                bmr.setScale(0, RoundingMode.HALF_UP),
                tdee.setScale(0, RoundingMode.HALF_UP),
                calories, proteinGrams, carbsGrams, fatGrams, fibreGrams, waterLitres
        );
    }

    /**
     * Mifflin-St Jeor BMR equation.
     * Male:   10W + 6.25H − 5A + 5
     * Female: 10W + 6.25H − 5A − 161
     */
    private BigDecimal calculateBmr(Profile profile) {
        BigDecimal base = BigDecimal.valueOf(10).multiply(profile.getWeightKg())
                .add(BigDecimal.valueOf(6.25).multiply(profile.getHeightCm()))
                .subtract(BigDecimal.valueOf(5).multiply(BigDecimal.valueOf(profile.getAge())));

        return "male".equalsIgnoreCase(profile.getGender())
                ? base.add(BigDecimal.valueOf(5))
                : base.subtract(BigDecimal.valueOf(161));
    }

    /**
     * Standard activity multiplier table (sedentary → very active).
     */
    private BigDecimal activityMultiplier(String activityLevel) {
        return switch (activityLevel.toLowerCase()) {
            case "sedentary"  -> BigDecimal.valueOf(1.2);
            case "light"      -> BigDecimal.valueOf(1.375);
            case "moderate"   -> BigDecimal.valueOf(1.55);
            case "active"     -> BigDecimal.valueOf(1.725);
            case "very_active"-> BigDecimal.valueOf(1.9);
            default           -> BigDecimal.valueOf(1.2); // safe fallback
        };
    }

    /**
     * Applies goal-based calorie adjustment:
     *  cut  → 20% deficit (conservative, preserves muscle)
     *  bulk → 10% surplus (lean bulk, minimises fat gain)
     *  maintain → no adjustment
     */
    private int applyGoalAdjustment(BigDecimal tdee, String goal) {
        BigDecimal adjusted = switch (goal.toLowerCase()) {
            case "cut", "fat_loss"      -> tdee.multiply(BigDecimal.valueOf(0.8));
            case "bulk", "muscle_gain"  -> tdee.multiply(BigDecimal.valueOf(1.1));
            default                     -> tdee; // maintain
        };
        return adjusted.setScale(0, RoundingMode.HALF_UP).intValue();
    }
}
