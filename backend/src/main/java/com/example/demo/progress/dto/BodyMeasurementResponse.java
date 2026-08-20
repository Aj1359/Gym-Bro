package com.example.demo.progress.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record BodyMeasurementResponse(
        BigDecimal weightKg, BigDecimal bodyFatPct, BigDecimal chestCm, BigDecimal waistCm,
        BigDecimal armsCm, BigDecimal neckCm, BigDecimal thighCm, BigDecimal calvesCm, LocalDateTime loggedAt
) {}
