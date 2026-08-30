package com.example.demo.progress;

import com.example.demo.progress.dto.*;
import com.example.demo.nutrition.Meal;
import com.example.demo.nutrition.MealRepository;
import com.example.demo.nutrition.Food;
import com.example.demo.nutrition.FoodRepository;
import com.example.demo.workout.Workout;
import com.example.demo.workout.WorkoutRepository;
import com.example.demo.workout.WorkoutSet;
import com.example.demo.workout.WorkoutSetRepository;
import com.example.demo.workout.WorkoutStatsService;
import com.example.demo.workout.WorkoutService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProgressService {

    private final BodyMeasurementRepository measurementRepository;
    private final WorkoutRepository workoutRepository;
    private final WorkoutSetRepository workoutSetRepository;
    private final MealRepository mealRepository;
    private final FoodRepository foodRepository;
    private final WorkoutStatsService statsService;
    private final WorkoutService workoutService;

    public ProgressService(BodyMeasurementRepository measurementRepository, WorkoutRepository workoutRepository,
                            WorkoutSetRepository workoutSetRepository, MealRepository mealRepository,
                            FoodRepository foodRepository, WorkoutStatsService statsService, WorkoutService workoutService) {
        this.measurementRepository = measurementRepository;
        this.workoutRepository = workoutRepository;
        this.workoutSetRepository = workoutSetRepository;
        this.mealRepository = mealRepository;
        this.foodRepository = foodRepository;
        this.statsService = statsService;
        this.workoutService = workoutService;
    }

    @Transactional
    public BodyMeasurementResponse logMeasurement(UUID userId, LogMeasurementRequest request) {
        BodyMeasurement m = new BodyMeasurement(userId, request.weightKg(), request.bodyFatPct(),
                request.chestCm(), request.waistCm(), request.armsCm(), request.neckCm(),
                request.thighCm(), request.calvesCm());
        m = measurementRepository.save(m);
        return toResponse(m);
    }

    public ProgressOverview getOverview(UUID userId, int days) {
        LocalDateTime start = LocalDateTime.now().minusDays(days);
        LocalDateTime end = LocalDateTime.now();

        List<DataPoint> weightTrend = measurementRepository
                .findByUserIdAndLoggedAtBetweenOrderByLoggedAtAsc(userId, start, end)
                .stream()
                .filter(m -> m.getWeightKg() != null)
                .map(m -> new DataPoint(m.getLoggedAt().toLocalDate(), m.getWeightKg()))
                .collect(Collectors.toList());

        BigDecimal weightChange = null;
        if (weightTrend.size() >= 2) {
            weightChange = weightTrend.get(weightTrend.size() - 1).value().subtract(weightTrend.get(0).value());
        }

        List<DataPoint> calorieTrend = buildCalorieTrend(userId, days);
        List<DataPoint> volumeTrend = buildVolumeTrend(userId, start, end);

        BodyMeasurementResponse latest = measurementRepository.findByUserIdOrderByLoggedAtDesc(userId)
                .stream().findFirst().map(this::toResponse).orElse(null);

        return new ProgressOverview(weightTrend, weightChange, calorieTrend, volumeTrend, latest);
    }

    public List<DataPoint> getStrengthTrend(UUID userId, UUID exerciseId) {
        return workoutService.getExerciseHistory(userId, exerciseId)
                .stream()
                .map(s -> new DataPoint(
                        s.getCreatedAt().toLocalDate(),
                        statsService.estimatedOneRepMax(s.getWeightKg(), s.getReps())
                ))
                // Keep the best e1RM per day if multiple sets logged same day
                .collect(Collectors.toMap(DataPoint::date, dp -> dp, (a, b) -> a.value().compareTo(b.value()) >= 0 ? a : b))
                .values()
                .stream()
                .sorted(Comparator.comparing(DataPoint::date))
                .collect(Collectors.toList());
    }

    private List<DataPoint> buildCalorieTrend(UUID userId, int days) {
        LocalDateTime start = LocalDateTime.now().minusDays(days).toLocalDate().atStartOfDay();
        LocalDateTime end = LocalDateTime.now().plusDays(1).toLocalDate().atStartOfDay();

        List<Meal> meals = mealRepository.findByUserIdAndLoggedAtBetweenOrderByLoggedAtAsc(userId, start, end);

        Map<LocalDate, BigDecimal> byDay = new TreeMap<>();
        for (Meal meal : meals) {
            Food food = foodRepository.findById(meal.getFoodId()).orElse(null);
            if (food == null) continue;

            BigDecimal scale = meal.getQuantity().divide(food.getServingSize(), 4, RoundingMode.HALF_UP);
            BigDecimal cals = food.getCalories().multiply(scale);

            LocalDate day = meal.getLoggedAt().toLocalDate();
            byDay.merge(day, cals, BigDecimal::add);
        }

        return byDay.entrySet().stream()
                .map(e -> new DataPoint(e.getKey(), e.getValue().setScale(0, RoundingMode.HALF_UP)))
                .collect(Collectors.toList());
    }

    private List<DataPoint> buildVolumeTrend(UUID userId, LocalDateTime start, LocalDateTime end) {
        List<Workout> workouts = workoutRepository.findByUserIdAndStartedAtBetweenOrderByStartedAtAsc(userId, start, end);

        List<DataPoint> points = new ArrayList<>();
        for (Workout w : workouts) {
            List<WorkoutSet> sets = workoutSetRepository.findByWorkoutIdOrderBySetNumberAsc(w.getId());
            BigDecimal volume = statsService.totalVolume(sets);
            if (volume.compareTo(BigDecimal.ZERO) > 0) {
                points.add(new DataPoint(w.getStartedAt().toLocalDate(), volume));
            }
        }
        return points;
    }

    private BodyMeasurementResponse toResponse(BodyMeasurement m) {
        return new BodyMeasurementResponse(m.getWeightKg(), m.getBodyFatPct(), m.getChestCm(), m.getWaistCm(),
                m.getArmsCm(), m.getNeckCm(), m.getThighCm(), m.getCalvesCm(), m.getLoggedAt());
    }
}
