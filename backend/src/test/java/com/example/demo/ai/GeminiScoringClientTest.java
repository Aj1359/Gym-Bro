package com.example.demo.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class GeminiScoringClientTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void scoreCircuit_returnsFallbackWhenApiKeyMissing() {
        GeminiScoringClient client = new GeminiScoringClient("", objectMapper);
        AiScoreResult result = client.scoreCircuit("Sample prompt");

        assertNotNull(result);
        assertTrue(result.overallScore() >= 0 && result.overallScore() <= 100);
        assertTrue(result.planQualityScore() >= 0 && result.planQualityScore() <= 100);
        assertTrue(result.adherenceScore() >= 0 && result.adherenceScore() <= 100);
        assertNotNull(result.summaryFeedback());
        assertFalse(result.summaryFeedback().isBlank());
    }

    @Test
    void fallback_createsValidDefaultScores() {
        AiScoreResult fallback = AiScoreResult.fallback();
        assertEquals(70, fallback.overallScore());
        assertEquals(70, fallback.planQualityScore());
        assertEquals(70, fallback.adherenceScore());
        assertTrue(fallback.summaryFeedback().contains("safely preserved"));
    }
}
