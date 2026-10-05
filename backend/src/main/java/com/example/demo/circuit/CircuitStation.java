package com.example.demo.circuit;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "circuit_stations")
public class CircuitStation {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "circuit_session_id", nullable = false)
    private UUID circuitSessionId;

    @Column(name = "station_name", nullable = false, length = 150)
    private String stationName;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    @Column(name = "planned_type", nullable = false, length = 10)
    private String plannedType; // 'time' or 'reps'

    @Column(name = "planned_target", nullable = false)
    private Integer plannedTarget;

    @Column(name = "planned_rest_seconds", nullable = false)
    private Integer plannedRestSeconds = 0;

    @Column(name = "actual_value")
    private Integer actualValue;

    @Column(name = "actual_notes", length = 255)
    private String actualNotes;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    protected CircuitStation() {}

    public CircuitStation(UUID circuitSessionId, String stationName, Integer orderIndex,
                          String plannedType, Integer plannedTarget, Integer plannedRestSeconds) {
        this.circuitSessionId = circuitSessionId;
        this.stationName = stationName;
        this.orderIndex = orderIndex;
        this.plannedType = plannedType;
        this.plannedTarget = plannedTarget;
        this.plannedRestSeconds = plannedRestSeconds != null ? plannedRestSeconds : 0;
        this.createdAt = LocalDateTime.now();
    }

    public UUID getId() { return id; }
    public UUID getCircuitSessionId() { return circuitSessionId; }
    public String getStationName() { return stationName; }
    public Integer getOrderIndex() { return orderIndex; }
    public String getPlannedType() { return plannedType; }
    public Integer getPlannedTarget() { return plannedTarget; }
    public Integer getPlannedRestSeconds() { return plannedRestSeconds; }
    public Integer getActualValue() { return actualValue; }
    public String getActualNotes() { return actualNotes; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void logExecution(Integer actualValue, String actualNotes) {
        this.actualValue = actualValue;
        this.actualNotes = actualNotes;
    }
}
