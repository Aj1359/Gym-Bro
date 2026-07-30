package com.example.demo.profile.dto;

import com.example.demo.profile.GoalCalculationService.GoalTargets;
import java.math.BigDecimal;

/**
 * Outgoing response for GET /profile and PUT /profile.
 *
 * GoalTargets is bundled here (rather than a separate endpoint) because the frontend
 * always needs both the raw profile fields and the computed targets on the same page.
 * One request instead of two — a deliberate coupling choice, not an accident.
 */
public record ProfileResponse(
        Integer age,
        BigDecimal heightCm,
        BigDecimal weightKg,
        String gender,
        String goal,
        String activityLevel,
        String experienceLevel,
        GoalTargets targets
) {}
