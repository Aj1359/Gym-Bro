package com.example.demo.circuit;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface CircuitAiReportRepository extends JpaRepository<CircuitAiReport, UUID> {
    Optional<CircuitAiReport> findByCircuitSessionId(UUID circuitSessionId);
}
