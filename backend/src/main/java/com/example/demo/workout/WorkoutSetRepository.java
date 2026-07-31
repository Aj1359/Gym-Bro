package com.example.demo.workout;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.UUID;

public interface WorkoutSetRepository extends JpaRepository<WorkoutSet, UUID> {
    List<WorkoutSet> findByWorkoutIdOrderBySetNumberAsc(UUID workoutId);

    @Query(value = """
        SELECT ws.* FROM workout_sets ws
        JOIN workouts w ON w.id = ws.workout_id
        WHERE w.user_id = :userId AND ws.exercise_id = :exerciseId
        ORDER BY ws.created_at ASC
        """, nativeQuery = true)
    List<WorkoutSet> findHistoryForExercise(@Param("userId") UUID userId, @Param("exerciseId") UUID exerciseId);
}
