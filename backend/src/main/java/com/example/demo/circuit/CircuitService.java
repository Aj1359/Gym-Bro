package com.example.demo.circuit;

import com.example.demo.circuit.dto.*;
import com.example.demo.circuit.event.CircuitCompletedEvent;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CircuitService {

    private final CircuitSessionRepository sessionRepository;
    private final CircuitStationRepository stationRepository;
    private final CircuitAiReportRepository aiReportRepository;
    private final com.example.demo.common.outbox.OutboxEventRepository outboxRepository;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    public CircuitService(CircuitSessionRepository sessionRepository,
                          CircuitStationRepository stationRepository,
                          CircuitAiReportRepository aiReportRepository,
                          com.example.demo.common.outbox.OutboxEventRepository outboxRepository,
                          com.fasterxml.jackson.databind.ObjectMapper objectMapper) {
        this.sessionRepository = sessionRepository;
        this.stationRepository = stationRepository;
        this.aiReportRepository = aiReportRepository;
        this.outboxRepository = outboxRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public CircuitSessionResponse createCircuit(UUID userId, CreateCircuitRequest request) {
        CircuitSession session = sessionRepository.save(
                new CircuitSession(userId, request.title(), request.overallNotes())
        );

        List<CircuitStation> stations = request.stations().stream()
                .map(input -> new CircuitStation(
                        session.getId(),
                        input.stationName(),
                        input.orderIndex(),
                        input.plannedType(),
                        input.plannedTarget(),
                        input.plannedRestSeconds()
                ))
                .collect(Collectors.toList());

        stationRepository.saveAll(stations);
        return toResponse(session, stations, null);
    }

    public List<CircuitSessionResponse> getSessions(UUID userId) {
        return sessionRepository.findByUserIdOrderBySessionDateDesc(userId).stream()
                .map(s -> {
                    List<CircuitStation> stations = stationRepository.findByCircuitSessionIdOrderByOrderIndexAsc(s.getId());
                    CircuitAiReport report = aiReportRepository.findByCircuitSessionId(s.getId()).orElse(null);
                    return toResponse(s, stations, report);
                })
                .collect(Collectors.toList());
    }

    public CircuitSessionResponse getSession(UUID userId, UUID circuitId) {
        CircuitSession session = findOwnedSession(userId, circuitId);
        List<CircuitStation> stations = stationRepository.findByCircuitSessionIdOrderByOrderIndexAsc(circuitId);
        CircuitAiReport report = aiReportRepository.findByCircuitSessionId(circuitId).orElse(null);
        return toResponse(session, stations, report);
    }

    @Transactional
    public CircuitSessionResponse logStation(UUID userId, UUID circuitId, UUID stationId, LogStationRequest request) {
        CircuitSession session = findOwnedSession(userId, circuitId);
        CircuitStation station = stationRepository.findById(stationId)
                .orElseThrow(() -> new IllegalArgumentException("Station not found"));

        if (!station.getCircuitSessionId().equals(circuitId)) {
            throw new IllegalArgumentException("Station does not belong to this circuit session");
        }

        station.logExecution(request.actualValue(), request.actualNotes());
        stationRepository.save(station);

        List<CircuitStation> stations = stationRepository.findByCircuitSessionIdOrderByOrderIndexAsc(circuitId);
        CircuitAiReport report = aiReportRepository.findByCircuitSessionId(circuitId).orElse(null);
        return toResponse(session, stations, report);
    }

    @Transactional
    public CircuitSessionResponse completeCircuit(UUID userId, UUID circuitId, String notes) {
        CircuitSession session = findOwnedSession(userId, circuitId);
        session.complete(notes);
        sessionRepository.save(session);

        List<CircuitStation> stations = stationRepository.findByCircuitSessionIdOrderByOrderIndexAsc(circuitId);
        CircuitAiReport report = aiReportRepository.findByCircuitSessionId(circuitId).orElse(null);

        List<CircuitCompletedEvent.StationSnapshot> snapshots = stations.stream()
                .map(st -> new CircuitCompletedEvent.StationSnapshot(
                        st.getStationName(),
                        st.getOrderIndex(),
                        st.getPlannedType(),
                        st.getPlannedTarget(),
                        st.getPlannedRestSeconds(),
                        st.getActualValue(),
                        st.getActualNotes()
                ))
                .collect(Collectors.toList());

        CircuitCompletedEvent eventPayload = new CircuitCompletedEvent(
                session.getId(),
                userId,
                session.getTitle(),
                session.getOverallNotes(),
                snapshots,
                session.getCompletedAt()
        );

        try {
            String payloadJson = objectMapper.writeValueAsString(eventPayload);
            outboxRepository.save(new com.example.demo.common.outbox.OutboxEvent(
                    "Circuit", session.getId(), "CircuitCompletedEvent", payloadJson
            ));
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize Outbox event for circuit", e);
        }

        return toResponse(session, stations, report);
    }

    private CircuitSession findOwnedSession(UUID userId, UUID circuitId) {
        CircuitSession session = sessionRepository.findById(circuitId)
                .orElseThrow(() -> new IllegalArgumentException("Circuit session not found"));
        if (!session.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Circuit session not found");
        }
        return session;
    }

    private CircuitSessionResponse toResponse(CircuitSession session, List<CircuitStation> stations, CircuitAiReport report) {
        List<StationResponse> stationResponses = stations.stream()
                .map(st -> new StationResponse(
                        st.getId(),
                        st.getCircuitSessionId(),
                        st.getStationName(),
                        st.getOrderIndex(),
                        st.getPlannedType(),
                        st.getPlannedTarget(),
                        st.getPlannedRestSeconds(),
                        st.getActualValue(),
                        st.getActualNotes()
                ))
                .collect(Collectors.toList());

        AiReportResponse aiResponse = report != null
                ? new AiReportResponse(
                report.getCircuitSessionId(),
                report.getPlanQualityScore(),
                report.getAdherenceScore(),
                report.getOverallScore(),
                report.getSummaryFeedback(),
                report.getGeneratedAt()
        )
                : null;

        return new CircuitSessionResponse(
                session.getId(),
                session.getUserId(),
                session.getTitle(),
                session.getOverallNotes(),
                session.getStatus(),
                session.getSessionDate(),
                session.getCompletedAt(),
                session.getCreatedAt(),
                stationResponses,
                aiResponse
        );
    }
}
