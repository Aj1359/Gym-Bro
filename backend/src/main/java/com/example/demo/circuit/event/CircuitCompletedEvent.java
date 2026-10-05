package com.example.demo.circuit.event;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record CircuitCompletedEvent(
        UUID sessionId,
        UUID userId,
        String title,
        String overallNotes,
        List<StationSnapshot> stations,
        LocalDateTime completedAt
) {
    public record StationSnapshot(
            String stationName,
            int orderIndex,
            String plannedType,
            int plannedTarget,
            int plannedRestSeconds,
            Integer actualValue,
            String actualNotes
    ) {}
}
