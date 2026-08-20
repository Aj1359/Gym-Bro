package com.example.demo.progress;

import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface BodyMeasurementRepository extends JpaRepository<BodyMeasurement, UUID> {
    List<BodyMeasurement> findByUserIdAndLoggedAtBetweenOrderByLoggedAtAsc(UUID userId, LocalDateTime start, LocalDateTime end);
    List<BodyMeasurement> findByUserIdOrderByLoggedAtDesc(UUID userId);
}
