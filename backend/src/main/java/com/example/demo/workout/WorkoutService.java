package com.example.demo.workout;

import com.example.demo.workout.dto.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class WorkoutService {

    private final WorkoutRepository workoutRepository;
    private final WorkoutSetRepository workoutSetRepository;
    private final TemplateService templateService;
    private final WorkoutStatsService statsService;

    public WorkoutService(WorkoutRepository workoutRepository, WorkoutSetRepository workoutSetRepository, TemplateService templateService, WorkoutStatsService statsService) {
        this.workoutRepository = workoutRepository;
        this.workoutSetRepository = workoutSetRepository;
        this.templateService = templateService;
        this.statsService = statsService;
    }

    @Transactional
    public WorkoutResponse startWorkout(UUID userId, StartWorkoutRequest request) {
        Workout workout = new Workout(userId, request.title());
        if (request.templateId() != null) {
            workout.setTemplateId(request.templateId());
        }
        workout = workoutRepository.save(workout);
        return toResponse(userId, workout);
    }

    public List<WorkoutResponse> getUserWorkouts(UUID userId) {
        return workoutRepository.findByUserIdOrderByStartedAtDesc(userId)
                .stream().map(w -> toResponse(userId, w)).collect(Collectors.toList());
    }

    public WorkoutResponse getWorkout(UUID userId, UUID workoutId) {
        return toResponse(userId, findOwnedWorkout(userId, workoutId));
    }

    @Transactional
    public WorkoutResponse logSet(UUID userId, UUID workoutId, LogSetRequest request) {
        Workout workout = findOwnedWorkout(userId, workoutId);

        if (workout.getCompletedAt() != null) {
            throw new IllegalStateException("Cannot add sets to a completed workout");
        }

        WorkoutSet set = new WorkoutSet(
                workout.getId(), request.exerciseId(), request.setNumber(),
                request.weightKg(), request.reps(), request.rpe()
        );
        workoutSetRepository.save(set);

        return toResponse(userId, workout);
    }

    @Transactional
    public WorkoutResponse completeWorkout(UUID userId, UUID workoutId) {
        Workout workout = findOwnedWorkout(userId, workoutId);
        workout.complete();
        workout = workoutRepository.save(workout);
        return toResponse(userId, workout);
    }

    private Workout findOwnedWorkout(UUID userId, UUID workoutId) {
        Workout workout = workoutRepository.findById(workoutId)
                .orElseThrow(() -> new IllegalArgumentException("Workout not found"));

        if (!workout.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Workout not found");
        }
        return workout;
    }

    private WorkoutResponse toResponse(UUID userId, Workout workout) {
        List<WorkoutSet> rawSets = workoutSetRepository.findByWorkoutIdOrderBySetNumberAsc(workout.getId());

        List<WorkoutSetResponse> sets = rawSets.stream().map(s -> {
            java.math.BigDecimal oneRepMax = statsService.estimatedOneRepMax(s.getWeightKg(), s.getReps());

            List<WorkoutSet> priorSets = workoutSetRepository.findHistoryForExercise(userId, s.getExerciseId())
                    .stream()
                    .filter(prior -> prior.getCreatedAt().isBefore(s.getCreatedAt()))
                    .collect(Collectors.toList());

            boolean isPr = statsService.isPersonalRecord(oneRepMax, priorSets);

            return new WorkoutSetResponse(s.getId(), s.getExerciseId(), s.getSetNumber(),
                    s.getWeightKg(), s.getReps(), s.getRpe(), oneRepMax, isPr);
        }).collect(Collectors.toList());

        List<TemplateExerciseResponse> plannedExercises = workout.getTemplateId() != null
                ? templateService.buildExerciseResponses(workout.getTemplateId())
                : List.of();

        return new WorkoutResponse(workout.getId(), workout.getTitle(), workout.getStartedAt(),
                workout.getCompletedAt(), sets, plannedExercises, statsService.totalVolume(rawSets));
    }
}
