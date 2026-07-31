package com.example.demo.workout;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "workout_day_exercises")
public class WorkoutDayExercise {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "template_id", nullable = false)
    private UUID templateId;

    @Column(name = "exercise_id", nullable = false)
    private UUID exerciseId;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    @Column(name = "target_sets", nullable = false)
    private Integer targetSets;

    @Column(name = "target_reps", nullable = false)
    private Integer targetReps;

    @Column(name = "target_weight_kg")
    private BigDecimal targetWeightKg;

    protected WorkoutDayExercise() {}

    public WorkoutDayExercise(UUID templateId, UUID exerciseId, Integer orderIndex,
                               Integer targetSets, Integer targetReps, BigDecimal targetWeightKg) {
        this.templateId = templateId;
        this.exerciseId = exerciseId;
        this.orderIndex = orderIndex;
        this.targetSets = targetSets;
        this.targetReps = targetReps;
        this.targetWeightKg = targetWeightKg;
    }

    public UUID getId() { return id; }
    public UUID getTemplateId() { return templateId; }
    public UUID getExerciseId() { return exerciseId; }
    public Integer getOrderIndex() { return orderIndex; }
    public Integer getTargetSets() { return targetSets; }
    public Integer getTargetReps() { return targetReps; }
    public BigDecimal getTargetWeightKg() { return targetWeightKg; }
}
