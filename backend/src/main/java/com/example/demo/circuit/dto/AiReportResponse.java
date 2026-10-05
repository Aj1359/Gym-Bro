package com.example.demo.circuit.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record AiReportResponse(
        UUID circuitSessionId,
        int planQualityScore,
        int adherenceScore,
        int overallScore,
        String summaryFeedback,
        LocalDateTime generatedAt
) {}
