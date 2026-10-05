package com.example.demo.circuit;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "circuit_ai_reports")
public class CircuitAiReport {

    @Id
    @Column(name = "circuit_session_id")
    private UUID circuitSessionId;

    @Column(name = "plan_quality_score", nullable = false)
    private Integer planQualityScore;

    @Column(name = "adherence_score", nullable = false)
    private Integer adherenceScore;

    @Column(name = "overall_score", nullable = false)
    private Integer overallScore;

    @Column(name = "summary_feedback", nullable = false, length = 1000)
    private String summaryFeedback;

    @Column(name = "generated_at", nullable = false)
    private LocalDateTime generatedAt = LocalDateTime.now();

    protected CircuitAiReport() {}

    public CircuitAiReport(UUID circuitSessionId, Integer planQualityScore, Integer adherenceScore,
                           Integer overallScore, String summaryFeedback) {
        this.circuitSessionId = circuitSessionId;
        this.planQualityScore = planQualityScore;
        this.adherenceScore = adherenceScore;
        this.overallScore = overallScore;
        this.summaryFeedback = summaryFeedback;
        this.generatedAt = LocalDateTime.now();
    }

    public UUID getCircuitSessionId() { return circuitSessionId; }
    public Integer getPlanQualityScore() { return planQualityScore; }
    public Integer getAdherenceScore() { return adherenceScore; }
    public Integer getOverallScore() { return overallScore; }
    public String getSummaryFeedback() { return summaryFeedback; }
    public LocalDateTime getGeneratedAt() { return generatedAt; }
}
