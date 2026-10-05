package com.example.demo.workout;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class WorkoutStatsServiceTest {

    private final WorkoutStatsService service = new WorkoutStatsService();

    @Test
    void estimatedOneRepMax_calculatesCorrectlyUsingEpleyFormula() {
        // 60kg x 8 reps -> 60 * (1 + 8/30) = 76.0
        BigDecimal result = service.estimatedOneRepMax(BigDecimal.valueOf(60), 8);
        assertEquals(0, BigDecimal.valueOf(76.0).compareTo(result));
    }

    @Test
    void estimatedOneRepMax_returnsZero_whenWeightIsNull() {
        BigDecimal result = service.estimatedOneRepMax(null, 8);
        assertEquals(0, BigDecimal.ZERO.compareTo(result));
    }

    @Test
    void estimatedOneRepMax_returnsZero_whenRepsIsZeroOrNegative() {
        assertEquals(0, BigDecimal.ZERO.compareTo(service.estimatedOneRepMax(BigDecimal.valueOf(60), 0)));
        assertEquals(0, BigDecimal.ZERO.compareTo(service.estimatedOneRepMax(BigDecimal.valueOf(60), -5)));
    }

    @Test
    void totalVolume_sumsWeightTimesRepsAcrossAllSets() {
        WorkoutSet set1 = new WorkoutSet(null, null, 1, BigDecimal.valueOf(60), 8, null);
        WorkoutSet set2 = new WorkoutSet(null, null, 2, BigDecimal.valueOf(65), 6, null);
        // (60*8) + (65*6) = 480 + 390 = 870
        BigDecimal result = service.totalVolume(List.of(set1, set2));
        assertEquals(0, BigDecimal.valueOf(870).compareTo(result));
    }

    @Test
    void totalVolume_ignoresSetsWithNullWeight() {
        WorkoutSet bodyweightSet = new WorkoutSet(null, null, 1, null, 12, null);
        BigDecimal result = service.totalVolume(List.of(bodyweightSet));
        assertEquals(0, BigDecimal.ZERO.compareTo(result));
    }

    @Test
    void isPersonalRecord_trueWhenNewMaxBeatsAllPriorSets() {
        WorkoutSet priorSet = new WorkoutSet(null, null, 1, BigDecimal.valueOf(50), 8, null);
        BigDecimal newOneRepMax = service.estimatedOneRepMax(BigDecimal.valueOf(60), 8);
        assertTrue(service.isPersonalRecord(newOneRepMax, List.of(priorSet)));
    }

    @Test
    void isPersonalRecord_falseWhenNewMaxDoesNotBeatPriorBest() {
        WorkoutSet priorSet = new WorkoutSet(null, null, 1, BigDecimal.valueOf(70), 8, null);
        BigDecimal newOneRepMax = service.estimatedOneRepMax(BigDecimal.valueOf(60), 8);
        assertFalse(service.isPersonalRecord(newOneRepMax, List.of(priorSet)));
    }

    @Test
    void isPersonalRecord_trueOnFirstEverSet_whenNoPriorHistory() {
        BigDecimal newOneRepMax = service.estimatedOneRepMax(BigDecimal.valueOf(60), 8);
        assertTrue(service.isPersonalRecord(newOneRepMax, List.of()));
    }
}
