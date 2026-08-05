package com.example.demo.nutrition;

import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface WaterLogRepository extends JpaRepository<WaterLog, UUID> {
    List<WaterLog> findByUserIdAndLoggedAtBetween(UUID userId, LocalDateTime start, LocalDateTime end);
}
