package com.example.demo.circuit.dto;

import java.util.UUID;

public record StationResponse(
        UUID id,
        UUID circuitSessionId,
        String stationName,
        Integer orderIndex,
        String plannedType,
        Integer plannedTarget,
        Integer plannedRestSeconds,
        Integer actualValue,
        String actualNotes
) {}
