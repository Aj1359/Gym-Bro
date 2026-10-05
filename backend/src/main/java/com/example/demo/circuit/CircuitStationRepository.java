package com.example.demo.circuit;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface CircuitStationRepository extends JpaRepository<CircuitStation, UUID> {
    List<CircuitStation> findByCircuitSessionIdOrderByOrderIndexAsc(UUID circuitSessionId);
}
