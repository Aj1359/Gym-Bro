package com.example.demo.dashboard.dto;

import java.util.UUID;

public record TodaysWorkoutSummary(UUID workoutId, String title, boolean completed) {}
