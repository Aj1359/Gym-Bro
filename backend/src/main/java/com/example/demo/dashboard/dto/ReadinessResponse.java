package com.example.demo.dashboard.dto;

public record ReadinessResponse(
        int score, // 0-100
        String status, // e.g. "Prime", "Recovering", "Fatigued"
        String recommendation
) {}
