package com.example.demo.ai;

public record AiScoreResult(
        int planQualityScore,
        int adherenceScore,
        int overallScore,
        String summaryFeedback
) {
    public static AiScoreResult fallback() {
        return new AiScoreResult(
                70,
                70,
                70,
                "Circuit recorded successfully. AI scoring service was temporarily unavailable, but your effort and logged stations are safely preserved."
        );
    }
}
