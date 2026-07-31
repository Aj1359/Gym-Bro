package com.example.demo.workout;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class WorkoutStatsService {

    /**
     * Epley formula: estimated 1-rep max = weight × (1 + reps/30)
     * Widely used, reasonably accurate for reps under ~12.
     */
    public BigDecimal estimatedOneRepMax(BigDecimal weightKg, Integer reps) {
        if (weightKg == null || reps == null || reps <= 0) return BigDecimal.ZERO;

        BigDecimal repsFactor = BigDecimal.ONE.add(
                BigDecimal.valueOf(reps).divide(BigDecimal.valueOf(30), 4, RoundingMode.HALF_UP)
        );
        return weightKg.multiply(repsFactor).setScale(1, RoundingMode.HALF_UP);
    }

    /**
     * Total volume for a set: weight × reps.
     * Summed across a list of sets = session volume.
     */
    public BigDecimal totalVolume(List<WorkoutSet> sets) {
        return sets.stream()
                .filter(s -> s.getWeightKg() != null)
                .map(s -> s.getWeightKg().multiply(BigDecimal.valueOf(s.getReps())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * A set is a personal record if its estimated 1RM beats every prior set
     * logged for this same exercise (across all past workouts).
     */
    public boolean isPersonalRecord(BigDecimal newOneRepMax, List<WorkoutSet> priorSets) {
        if (newOneRepMax.compareTo(BigDecimal.ZERO) == 0) return false;

        BigDecimal maxPrior = priorSets.stream()
                .map(s -> estimatedOneRepMax(s.getWeightKg(), s.getReps()))
                .max(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);

        return newOneRepMax.compareTo(maxPrior) > 0;
    }
}
