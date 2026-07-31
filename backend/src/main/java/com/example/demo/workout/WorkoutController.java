package com.example.demo.workout;

import com.example.demo.workout.dto.*;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/workouts")
public class WorkoutController {

    private final WorkoutService workoutService;

    public WorkoutController(WorkoutService workoutService) {
        this.workoutService = workoutService;
    }

    @PostMapping
    public ResponseEntity<WorkoutResponse> startWorkout(@AuthenticationPrincipal UUID userId,
                                                           @Valid @RequestBody StartWorkoutRequest request) {
        return ResponseEntity.ok(workoutService.startWorkout(userId, request));
    }

    @GetMapping
    public ResponseEntity<List<WorkoutResponse>> getWorkouts(@AuthenticationPrincipal UUID userId) {
        return ResponseEntity.ok(workoutService.getUserWorkouts(userId));
    }

    @GetMapping("/{workoutId}")
    public ResponseEntity<WorkoutResponse> getWorkout(@AuthenticationPrincipal UUID userId,
                                                         @PathVariable UUID workoutId) {
        return ResponseEntity.ok(workoutService.getWorkout(userId, workoutId));
    }

    @PostMapping("/{workoutId}/sets")
    public ResponseEntity<WorkoutResponse> logSet(@AuthenticationPrincipal UUID userId,
                                                     @PathVariable UUID workoutId,
                                                     @Valid @RequestBody LogSetRequest request) {
        return ResponseEntity.ok(workoutService.logSet(userId, workoutId, request));
    }

    @PutMapping("/{workoutId}/complete")
    public ResponseEntity<WorkoutResponse> completeWorkout(@AuthenticationPrincipal UUID userId,
                                                              @PathVariable UUID workoutId) {
        return ResponseEntity.ok(workoutService.completeWorkout(userId, workoutId));
    }
}
