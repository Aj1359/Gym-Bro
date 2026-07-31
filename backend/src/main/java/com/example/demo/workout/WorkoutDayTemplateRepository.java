package com.example.demo.workout;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface WorkoutDayTemplateRepository extends JpaRepository<WorkoutDayTemplate, UUID> {
    List<WorkoutDayTemplate> findByUserIdOrderByDisplayOrderAsc(UUID userId);
}
