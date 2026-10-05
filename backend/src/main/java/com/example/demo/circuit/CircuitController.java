package com.example.demo.circuit;

import com.example.demo.circuit.dto.*;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/circuits")
public class CircuitController {

    private final CircuitService circuitService;

    public CircuitController(CircuitService circuitService) {
        this.circuitService = circuitService;
    }

    @PostMapping
    public ResponseEntity<CircuitSessionResponse> create(
            @AuthenticationPrincipal UUID userId,
            @Valid @RequestBody CreateCircuitRequest request
    ) {
        return ResponseEntity.ok(circuitService.createCircuit(userId, request));
    }

    @GetMapping
    public ResponseEntity<List<CircuitSessionResponse>> getAll(@AuthenticationPrincipal UUID userId) {
        return ResponseEntity.ok(circuitService.getSessions(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CircuitSessionResponse> getById(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(circuitService.getSession(userId, id));
    }

    @PostMapping("/{id}/stations/{stationId}")
    public ResponseEntity<CircuitSessionResponse> logStation(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id,
            @PathVariable UUID stationId,
            @RequestBody LogStationRequest request
    ) {
        return ResponseEntity.ok(circuitService.logStation(userId, id, stationId, request));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<CircuitSessionResponse> complete(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> body
    ) {
        String notes = body != null ? body.get("overallNotes") : null;
        return ResponseEntity.ok(circuitService.completeCircuit(userId, id, notes));
    }
}
