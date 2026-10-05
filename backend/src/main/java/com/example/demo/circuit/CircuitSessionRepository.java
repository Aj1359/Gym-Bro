package com.example.demo.circuit;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface CircuitSessionRepository extends JpaRepository<CircuitSession, UUID> {
    List<CircuitSession> findByUserIdOrderBySessionDateDesc(UUID userId);
}
