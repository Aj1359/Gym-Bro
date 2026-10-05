package com.example.demo.circuit.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record CircuitSessionResponse(
        UUID id,
        UUID userId,
        String title,
        String overallNotes,
        String status,
        LocalDate sessionDate,
        LocalDateTime completedAt,
        LocalDateTime createdAt,
        List<StationResponse> stations,
        AiReportResponse aiReport
) {}
