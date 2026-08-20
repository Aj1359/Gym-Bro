package com.example.demo.progress.dto;

import java.math.BigDecimal;
import java.util.List;

public record ProgressOverview(
        List<DataPoint> weightTrend,
        BigDecimal weightChangeKg,
        List<DataPoint> calorieTrend,
        List<DataPoint> volumeTrend,
        BodyMeasurementResponse latestMeasurement
) {}
