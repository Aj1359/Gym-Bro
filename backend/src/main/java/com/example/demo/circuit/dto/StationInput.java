package com.example.demo.circuit.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record StationInput(
        @NotBlank(message = "Station name is required")
        String stationName,

        @NotNull(message = "Order index is required")
        Integer orderIndex,

        @NotBlank(message = "Planned type must be 'time' or 'reps'")
        @Pattern(regexp = "time|reps", message = "Planned type must be 'time' or 'reps'")
        String plannedType,

        @NotNull(message = "Planned target is required")
        @Min(value = 1, message = "Planned target must be at least 1")
        Integer plannedTarget,

        Integer plannedRestSeconds
) {}
