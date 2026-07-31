package com.example.demo.workout;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "workout_sets")
public class WorkoutSet {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "workout_id", nullable = false)
    private UUID workoutId;

    @Column(name = "exercise_id", nullable = false)
    private UUID exerciseId;

    @Column(name = "set_number", nullable = false)
    private Integer setNumber;

    @Column(name = "weight_kg")
    private BigDecimal weightKg;

    @Column(nullable = false)
    private Integer reps;

    private BigDecimal rpe;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    protected WorkoutSet() {}

    public WorkoutSet(UUID workoutId, UUID exerciseId, Integer setNumber,
                       BigDecimal weightKg, Integer reps, BigDecimal rpe) {
        this.workoutId = workoutId;
        this.exerciseId = exerciseId;
        this.setNumber = setNumber;
        this.weightKg = weightKg;
        this.reps = reps;
        this.rpe = rpe;
    }

    public UUID getId() { return id; }
    public UUID getWorkoutId() { return workoutId; }
    public UUID getExerciseId() { return exerciseId; }
    public Integer getSetNumber() { return setNumber; }
    public BigDecimal getWeightKg() { return weightKg; }
    public Integer getReps() { return reps; }
    public BigDecimal getRpe() { return rpe; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
