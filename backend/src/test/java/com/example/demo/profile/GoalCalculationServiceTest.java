package com.example.demo.profile;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class GoalCalculationServiceTest {

    private final GoalCalculationService service = new GoalCalculationService();

    @Test
    void calculate_computesExpectedTargetsForMaleCut() {
        Profile profile = new Profile(
                UUID.randomUUID(),
                25,
                BigDecimal.valueOf(180),
                BigDecimal.valueOf(80),
                "male",
                "cut",
                "moderate",
                "intermediate"
        );

        GoalCalculationService.GoalTargets targets = service.calculate(profile);

        // BMI: 80 / (1.8^2) = 24.7
        assertEquals(0, BigDecimal.valueOf(24.7).compareTo(targets.bmi()));

        // BMR: 10(80) + 6.25(180) - 5(25) + 5 = 1805
        assertEquals(0, BigDecimal.valueOf(1805).compareTo(targets.bmr()));

        // TDEE: 1805 * 1.55 = 2798
        assertEquals(0, BigDecimal.valueOf(2798).compareTo(targets.tdee()));

        // Calories: 2797.75 * 0.8 = 2238
        assertEquals(2238, targets.calories());

        // Protein: 80 * 2 = 160g
        assertEquals(160, targets.proteinGrams());

        // Fat: (2238 * 0.25) / 9 = 62g
        assertEquals(62, targets.fatGrams());

        // Carbs: (2238 - (160*4) - (62*9)) / 4 = 260g
        assertEquals(260, targets.carbsGrams());

        // Fibre: 2 * 14 = 28g
        assertEquals(28, targets.fibreGrams());

        // Water: 80 * 0.033 = 2.6L
        assertEquals(0, BigDecimal.valueOf(2.6).compareTo(targets.waterLitres()));
    }

    @Test
    void calculate_handlesFemaleBulk() {
        Profile profile = new Profile(
                UUID.randomUUID(),
                30,
                BigDecimal.valueOf(165),
                BigDecimal.valueOf(60),
                "female",
                "bulk",
                "active",
                "beginner"
        );

        GoalCalculationService.GoalTargets targets = service.calculate(profile);

        assertNotNull(targets);
        assertTrue(targets.calories() > targets.bmr().intValue());
        assertEquals(120, targets.proteinGrams()); // 60 * 2
        assertTrue(targets.waterLitres().compareTo(BigDecimal.ZERO) > 0);
    }
}
