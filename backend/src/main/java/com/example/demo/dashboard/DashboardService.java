package com.example.demo.dashboard;

import com.example.demo.dashboard.dto.*;
import com.example.demo.nutrition.Food;
import com.example.demo.nutrition.FoodRepository;
import com.example.demo.nutrition.Meal;
import com.example.demo.nutrition.MealRepository;
import com.example.demo.nutrition.NutritionService;
import com.example.demo.nutrition.dto.DailyNutritionSummary;
import com.example.demo.nutrition.dto.MealResponse;
import com.example.demo.profile.GoalCalculationService.GoalTargets;
import com.example.demo.profile.ProfileService;
import com.example.demo.profile.dto.ProfileResponse;
import com.example.demo.workout.Workout;
import com.example.demo.workout.WorkoutRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final ProfileService profileService;
    private final NutritionService nutritionService;
    private final WorkoutRepository workoutRepository;
    private final MealRepository mealRepository;
    private final FoodRepository foodRepository;

    public DashboardService(ProfileService profileService, NutritionService nutritionService,
                             WorkoutRepository workoutRepository, MealRepository mealRepository,
                             FoodRepository foodRepository) {
        this.profileService = profileService;
        this.nutritionService = nutritionService;
        this.workoutRepository = workoutRepository;
        this.mealRepository = mealRepository;
        this.foodRepository = foodRepository;
    }

    public DashboardResponse getDashboard(UUID userId) {
        LocalDate today = LocalDate.now();

        GoalTargets targets = null;
        BigDecimal currentWeight = null;
        try {
            ProfileResponse profile = profileService.getProfile(userId);
            targets = profile.targets();
            currentWeight = profile.weightKg();
        } catch (IllegalArgumentException e) {
            // No profile yet — dashboard still renders without targets
        }

        DailyNutritionSummary nutrition = nutritionService.getDailySummary(userId, today);
        TodaysWorkoutSummary todaysWorkout = buildTodaysWorkoutSummary(userId, today);

        List<Integer> weeklyScores = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate day = today.minusDays(i);
            if (day.isEqual(today)) {
                weeklyScores.add(computeDailyScoreUncached(userId, day, targets)); // always fresh for today
            } else {
                weeklyScores.add(computeDailyScore(userId, day, targets)); // cached, safe — day is finalized
            }
        }
        int weeklyConsistency = (int) weeklyScores.stream().filter(s -> s > 0).count();
        int dailyScore = weeklyScores.get(weeklyScores.size() - 1); // today = last entry

        int streak = calculateStreak(userId, today);
        MacroBreakdown macros = buildMacroBreakdown(nutrition);

        List<MealResponse> recentMeals = mealRepository.findTop4ByUserIdOrderByLoggedAtDesc(userId)
                .stream()
                .map(m -> {
                    Food food = foodRepository.findById(m.getFoodId()).orElseThrow();
                    return nutritionService.toMealResponsePublic(m, food);
                })
                .collect(Collectors.toList());

        List<RecentWorkoutSummary> recentWorkouts = workoutRepository.findTop3ByUserIdOrderByStartedAtDesc(userId)
                .stream()
                .map(w -> new RecentWorkoutSummary(w.getId(), w.getTitle(), w.getStartedAt(),
                        w.getCompletedAt() != null ? Duration.between(w.getStartedAt(), w.getCompletedAt()).toMinutes() : null))
                .collect(Collectors.toList());

        return new DashboardResponse(
                currentWeight,
                nutrition.totalCalories(), targets != null ? BigDecimal.valueOf(targets.calories()) : null,
                nutrition.totalProtein(), targets != null ? BigDecimal.valueOf(targets.proteinGrams()) : null,
                nutrition.totalCarbs(), targets != null ? BigDecimal.valueOf(targets.carbsGrams()) : null,
                nutrition.totalFat(), targets != null ? BigDecimal.valueOf(targets.fatGrams()) : null,
                nutrition.totalWaterMl(),
                targets != null ? targets.waterLitres().multiply(BigDecimal.valueOf(1000)).intValue() : null,
                macros, todaysWorkout, weeklyConsistency, weeklyScores, streak, dailyScore,
                recentMeals, recentWorkouts
        );
    }

    private MacroBreakdown buildMacroBreakdown(DailyNutritionSummary nutrition) {
        BigDecimal proteinCals = nutrition.totalProtein().multiply(BigDecimal.valueOf(4));
        BigDecimal carbsCals = nutrition.totalCarbs().multiply(BigDecimal.valueOf(4));
        BigDecimal fatCals = nutrition.totalFat().multiply(BigDecimal.valueOf(9));
        BigDecimal total = proteinCals.add(carbsCals).add(fatCals);

        if (total.compareTo(BigDecimal.ZERO) == 0) return new MacroBreakdown(0, 0, 0);

        return new MacroBreakdown(
                pct(proteinCals, total), pct(carbsCals, total), pct(fatCals, total)
        );
    }

    private int pct(BigDecimal part, BigDecimal total) {
        return part.divide(total, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).intValue();
    }

    private TodaysWorkoutSummary buildTodaysWorkoutSummary(UUID userId, LocalDate today) {
        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end = today.plusDays(1).atStartOfDay();
        List<Workout> todaysWorkouts = workoutRepository.findByUserIdAndStartedAtBetween(userId, start, end);
        if (todaysWorkouts.isEmpty()) return null;
        Workout latest = todaysWorkouts.stream().max(Comparator.comparing(Workout::getStartedAt)).orElseThrow();
        return new TodaysWorkoutSummary(latest.getId(), latest.getTitle(), latest.getCompletedAt() != null);
    }

    /**
     * Daily Score (0-100): weighted blend of workout completion, calorie adherence,
     * protein adherence, and water adherence. Gracefully reweights if targets are unavailable.
     */
    @Cacheable(value = "dashboardScore", key = "#userId + ':' + #date")
    public int computeDailyScore(UUID userId, LocalDate date, GoalTargets targets) {
        System.out.println("CACHE MISS — computing daily score for " + date);
        return computeDailyScoreUncached(userId, date, targets);
    }

    public int computeDailyScoreUncached(UUID userId, LocalDate date, GoalTargets targets) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.plusDays(1).atStartOfDay();

        boolean workedOut = !workoutRepository.findByUserIdAndStartedAtBetween(userId, start, end).isEmpty();
        DailyNutritionSummary nutrition = nutritionService.getDailySummary(userId, date);

        List<Double> componentScores = new ArrayList<>();
        List<Double> weights = new ArrayList<>();

        componentScores.add(workedOut ? 100.0 : 0.0);
        weights.add(0.4);

        if (targets != null) {
            double calorieScore = adherenceScore(nutrition.totalCalories().doubleValue(), targets.calories());
            double proteinScore = capAt100(nutrition.totalProtein().doubleValue() / targets.proteinGrams() * 100);
            double waterScore = capAt100(nutrition.totalWaterMl() / (targets.waterLitres().doubleValue() * 1000) * 100);

            componentScores.add(calorieScore); weights.add(0.2);
            componentScores.add(proteinScore); weights.add(0.2);
            componentScores.add(waterScore); weights.add(0.2);
        } else {
            // No profile yet — reweight fully onto workout completion alone
            weights.set(0, 1.0);
        }

        double weightSum = weights.stream().mapToDouble(Double::doubleValue).sum();
        double weighted = 0;
        for (int i = 0; i < componentScores.size(); i++) {
            weighted += componentScores.get(i) * (weights.get(i) / weightSum);
        }

        return (int) Math.round(weighted);
    }

    private double adherenceScore(double consumed, double target) {
        if (target == 0) return 0;
        double deviation = Math.abs(consumed - target) / target * 100;
        return capAt100(100 - deviation);
    }

    private double capAt100(double value) {
        return Math.max(0, Math.min(100, value));
    }

    private int calculateStreak(UUID userId, LocalDate today) {
        List<Workout> allWorkouts = workoutRepository.findByUserIdOrderByStartedAtDesc(userId);
        Set<LocalDate> workoutDays = allWorkouts.stream()
                .map(w -> w.getStartedAt().toLocalDate())
                .collect(Collectors.toCollection(TreeSet::new));
        if (workoutDays.isEmpty()) return 0;
        LocalDate cursor = workoutDays.contains(today) ? today : today.minusDays(1);
        int streak = 0;
        while (workoutDays.contains(cursor)) {
            streak++;
            cursor = cursor.minusDays(1);
        }
        return streak;
    }
}
