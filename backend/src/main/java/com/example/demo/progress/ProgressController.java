package com.example.demo.progress;

import com.example.demo.progress.dto.*;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
public class ProgressController {

    private final ProgressService progressService;

    public ProgressController(ProgressService progressService) {
        this.progressService = progressService;
    }

    @PostMapping("/measurements")
    public ResponseEntity<BodyMeasurementResponse> logMeasurement(@AuthenticationPrincipal UUID userId,
                                                                     @Valid @RequestBody LogMeasurementRequest request) {
        return ResponseEntity.ok(progressService.logMeasurement(userId, request));
    }

    @GetMapping("/progress")
    public ResponseEntity<ProgressOverview> getOverview(@AuthenticationPrincipal UUID userId,
                                                           @RequestParam(defaultValue = "90") int days) {
        return ResponseEntity.ok(progressService.getOverview(userId, days));
    }

    @GetMapping("/progress/strength/{exerciseId}")
    public ResponseEntity<List<DataPoint>> getStrengthTrend(@AuthenticationPrincipal UUID userId,
                                                                @PathVariable UUID exerciseId) {
        return ResponseEntity.ok(progressService.getStrengthTrend(userId, exerciseId));
    }
}
