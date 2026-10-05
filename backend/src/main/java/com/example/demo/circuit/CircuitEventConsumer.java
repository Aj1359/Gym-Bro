package com.example.demo.circuit;

import com.example.demo.ai.AiScoreResult;
import com.example.demo.ai.AiScoringClient;
import com.example.demo.circuit.event.CircuitCompletedEvent;
import com.example.demo.notification.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.example.demo.common.idempotency.ProcessedEvent;
import com.example.demo.common.idempotency.ProcessedEventRepository;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Component
public class CircuitEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(CircuitEventConsumer.class);

    private final AiScoringClient aiScoringClient;
    private final CircuitAiReportRepository aiReportRepository;
    private final NotificationService notificationService;
    private final ProcessedEventRepository processedEventRepository;

    public CircuitEventConsumer(AiScoringClient aiScoringClient,
                                CircuitAiReportRepository aiReportRepository,
                                NotificationService notificationService,
                                ProcessedEventRepository processedEventRepository) {
        this.aiScoringClient = aiScoringClient;
        this.aiReportRepository = aiReportRepository;
        this.notificationService = notificationService;
        this.processedEventRepository = processedEventRepository;
    }

    @EventListener
    @Transactional
    public void handleCircuitCompleted(CircuitCompletedEvent event) {
        UUID eventId = event.sessionId(); // Using sessionId as idempotency key
        
        if (processedEventRepository.existsByEventIdAndConsumerName(eventId, "CircuitEventConsumer")) {
            log.info("Ignoring duplicate circuit-completed event for session {}", eventId);
            return;
        }

        log.info("Received circuit-completed event for session {} (user {})", event.sessionId(), event.userId());

        String prompt = buildPrompt(event);
        AiScoreResult result = aiScoringClient.scoreCircuit(prompt);

        CircuitAiReport report = new CircuitAiReport(
                event.sessionId(),
                result.planQualityScore(),
                result.adherenceScore(),
                result.overallScore(),
                result.summaryFeedback()
        );

        aiReportRepository.save(report);

        String notifTitle = "Circuit Scored! ⚡";
        String notifBody = String.format("Your circuit \"%s\" scored %d/100 (Plan: %d, Adherence: %d). Check out your feedback!",
                event.title(), result.overallScore(), result.planQualityScore(), result.adherenceScore());

        notificationService.createNotification(event.userId(), notifTitle, notifBody, "circuit_scored");
        
        processedEventRepository.save(new ProcessedEvent(eventId, "CircuitEventConsumer"));
        
        log.info("Successfully generated and saved AI score for circuit {}", event.sessionId());
    }

    private String buildPrompt(CircuitCompletedEvent event) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are an expert athletic conditioning and circuit training coach. ");
        sb.append("Analyze this completed circuit session and provide an evaluation score (0-100) on two distinct dimensions:\n\n");
        sb.append("1. Plan Quality (0-100): Evaluate whether the station sequence, exercise selection, work/rest intervals, and pacing constitute a well-structured conditioning circuit. Judge the plan as written, independent of whether it was executed well.\n");
        sb.append("2. Adherence Score (0-100): Compare the actual logged performance against the planned targets. Missing stations or lower performance lower the score; exceeding targets does not penalize.\n");
        sb.append("3. Overall Score (0-100): Balanced aggregate of Plan Quality and Adherence.\n");
        sb.append("4. Summary Feedback: A concise 2-4 sentence constructive critique highlighting strengths and one actionable tip for improvement.\n\n");

        sb.append("Circuit Title: ").append(event.title()).append("\n");
        if (event.overallNotes() != null && !event.overallNotes().isBlank()) {
            sb.append("Athlete Notes: ").append(event.overallNotes()).append("\n");
        }
        sb.append("\nStations Logged:\n");

        for (CircuitCompletedEvent.StationSnapshot st : event.stations()) {
            sb.append(String.format("- Station %d: %s | Planned: %d %s (Rest: %ds) | Actual: %s %s | Notes: %s\n",
                    st.orderIndex(),
                    st.stationName(),
                    st.plannedTarget(),
                    st.plannedType().equals("time") ? "seconds" : "reps",
                    st.plannedRestSeconds(),
                    st.actualValue() != null ? st.actualValue().toString() : "Not logged",
                    st.plannedType().equals("time") ? "seconds" : "reps",
                    st.actualNotes() != null ? st.actualNotes() : "None"
            ));
        }

        sb.append("\nCRITICAL INSTRUCTION: Respond with ONLY a valid JSON object formatted exactly as follows with no markdown code fences or conversational prose:\n");
        sb.append("{\n");
        sb.append("  \"planQualityScore\": 85,\n");
        sb.append("  \"adherenceScore\": 90,\n");
        sb.append("  \"overallScore\": 88,\n");
        sb.append("  \"summaryFeedback\": \"Your feedback text here\"\n");
        sb.append("}\n");

        return sb.toString();
    }
}
