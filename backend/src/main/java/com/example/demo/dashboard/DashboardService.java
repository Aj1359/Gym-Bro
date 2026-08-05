package com.example.demo.dashboard;

import com.example.demo.dashboard.dto.*;
import com.example.demo.nutrition.NutritionService;
import com.example.demo.nutrition.dto.DailyNutritionSummary;
import com.example.demo.profile.GoalCalculationService.GoalTargets;
import com.example.demo.profile.ProfileService;
import com.example.demo.profile.dto.ProfileResponse;
import com.example.demo.workout.Workout;
import com.example.demo.workout.WorkoutRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final ProfileService profileService;
    private final NutritionService nutritionService;
    private final WorkoutRepository workoutRepository;

    public DashboardService(ProfileService profileService, NutritionService nutritionService,
                             WorkoutRepository workoutRepository) {
        this.profileService = profileService;
        this.nutritionService = nutritionService;
        this.workoutRepository = workoutRepository;
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
            // No profile yet — dashboard still renders, just without targets
        }

        DailyNutritionSummary nutrition = nutritionService.getDailySummary(userId, today);

        TodaysWorkoutSummary todaysWorkout = buildTodaysWorkoutSummary(userId, today);
        int weeklyConsistency = calculateWeeklyConsistency(userId, today);
        int streak = calculateStreak(userId, today);

        return new DashboardResponse(
                currentWeight,
                nutrition.totalCalories(),
                targets != null ? BigDecimal.valueOf(targets.calories()) : null,
                nutrition.totalProtein(),
                targets != null ? BigDecimal.valueOf(targets.proteinGrams()) : null,
                0, // No water tracking logic in previous days
                targets != null ? targets.waterLitres().multiply(BigDecimal.valueOf(1000)).intValue() : null,
                todaysWorkout,
                weeklyConsistency,
                streak
        );
    }

    private TodaysWorkoutSummary buildTodaysWorkoutSummary(UUID userId, LocalDate today) {
        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end = today.plusDays(1).atStartOfDay();

        List<Workout> todaysWorkouts = workoutRepository.findByUserIdAndStartedAtBetween(userId, start, end);
        if (todaysWorkouts.isEmpty()) return null;

        // If multiple sessions today, show the most recently started one
        Workout latest = todaysWorkouts.stream()
                .max(Comparator.comparing(Workout::getStartedAt))
                .orElseThrow();

        return new TodaysWorkoutSummary(latest.getId(), latest.getTitle(), latest.getCompletedAt() != null);
    }

    private int calculateWeeklyConsistency(UUID userId, LocalDate today) {
        LocalDateTime weekStart = today.minusDays(6).atStartOfDay();
        LocalDateTime weekEnd = today.plusDays(1).atStartOfDay();

        List<Workout> weekWorkouts = workoutRepository.findByUserIdAndStartedAtBetween(userId, weekStart, weekEnd);

        Set<LocalDate> activeDays = weekWorkouts.stream()
                .map(w -> w.getStartedAt().toLocalDate())
                .collect(Collectors.toSet());

        return activeDays.size(); // out of 7
    }

    private int calculateStreak(UUID userId, LocalDate today) {
        List<Workout> allWorkouts = workoutRepository.findByUserIdOrderByStartedAtDesc(userId);

        Set<LocalDate> workoutDays = allWorkouts.stream()
                .map(w -> w.getStartedAt().toLocalDate())
                .collect(Collectors.toCollection(TreeSet::new));

        if (workoutDays.isEmpty()) return 0;

        // Start counting from today if trained today, otherwise from yesterday
        // (a rest day today shouldn't immediately zero out an ongoing streak)
        LocalDate cursor = workoutDays.contains(today) ? today : today.minusDays(1);
        int streak = 0;

        while (workoutDays.contains(cursor)) {
            streak++;
            cursor = cursor.minusDays(1);
        }

        return streak;
    }
}
