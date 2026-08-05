package com.example.demo.workout;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface WorkoutRepository extends JpaRepository<Workout, UUID> {
    List<Workout> findByUserIdOrderByStartedAtDesc(UUID userId);
    List<Workout> findByUserIdAndStartedAtBetween(UUID userId, java.time.LocalDateTime start, java.time.LocalDateTime end);
}
