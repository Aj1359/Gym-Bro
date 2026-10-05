package com.example.demo.workout;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class ProgressiveOverloadEngine {

    /**
     * Recommends the next working weight and reps for an exercise based on the 
     * user's previous performance. This relies on deterministic rule-based algorithms.
     * 
     * Rules:
     * - If last RPE < 7: Increase weight by 5%
     * - If last RPE 7-8.5: Keep weight same, try to add 1-2 reps
     * - If last RPE >= 9: Deload weight by 10%
     */
    public Recommendation recommendNextSet(List<WorkoutSet> pastSets, int targetReps) {
        if (pastSets == null || pastSets.isEmpty()) {
            return new Recommendation(BigDecimal.ZERO, targetReps, "No prior data. Start with a conservative weight.");
        }

        // Get the heaviest successful set from the most recent workout for this exercise
        Optional<WorkoutSet> lastBestSetOpt = pastSets.stream()
                .sorted(Comparator.comparing(WorkoutSet::getCreatedAt).reversed()
                        .thenComparing(WorkoutSet::getWeightKg, Comparator.nullsFirst(Comparator.reverseOrder())))
                .findFirst();

        if (lastBestSetOpt.isEmpty() || lastBestSetOpt.get().getWeightKg() == null) {
            return new Recommendation(BigDecimal.ZERO, targetReps, "Missing weight data in history.");
        }

        WorkoutSet lastBestSet = lastBestSetOpt.get();
        BigDecimal currentWeight = lastBestSet.getWeightKg();
        BigDecimal lastRpe = lastBestSet.getRpe() != null ? lastBestSet.getRpe() : BigDecimal.valueOf(8.0); // Assume RPE 8 if not logged

        // RPE < 7 means it was too easy, progressive overload via weight
        if (lastRpe.compareTo(BigDecimal.valueOf(7.0)) < 0) {
            BigDecimal nextWeight = currentWeight.multiply(BigDecimal.valueOf(1.05)).setScale(1, RoundingMode.HALF_UP);
            return new Recommendation(nextWeight, targetReps, "Last set felt easy (RPE < 7). Recommending a 5% weight increase.");
        } 
        
        // RPE >= 9 means failure or near failure, deload for recovery
        if (lastRpe.compareTo(BigDecimal.valueOf(9.0)) >= 0) {
            BigDecimal deloadWeight = currentWeight.multiply(BigDecimal.valueOf(0.90)).setScale(1, RoundingMode.HALF_UP);
            return new Recommendation(deloadWeight, targetReps, "Last set was near failure (RPE 9+). Deloading by 10% to prioritize recovery and form.");
        }
        
        // RPE 7 - 8.5 means perfect working zone, progressive overload via volume/reps
        return new Recommendation(currentWeight, lastBestSet.getReps() + 1, "Perfect RPE zone (7-8.5). Keep weight the same and try to squeeze out 1 more rep.");
    }

    public record Recommendation(BigDecimal suggestedWeightKg, int suggestedReps, String rationale) {}
}
