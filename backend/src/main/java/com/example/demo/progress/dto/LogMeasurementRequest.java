package com.example.demo.progress.dto;

import java.math.BigDecimal;

public record LogMeasurementRequest(
        BigDecimal weightKg, BigDecimal bodyFatPct, BigDecimal chestCm, BigDecimal waistCm,
        BigDecimal armsCm, BigDecimal neckCm, BigDecimal thighCm, BigDecimal calvesCm
) {}
