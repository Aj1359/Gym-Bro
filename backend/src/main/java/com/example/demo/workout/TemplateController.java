package com.example.demo.workout;

import com.example.demo.workout.dto.*;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/templates")
public class TemplateController {

    private final TemplateService templateService;

    public TemplateController(TemplateService templateService) {
        this.templateService = templateService;
    }

    @PostMapping
    public ResponseEntity<TemplateResponse> create(@AuthenticationPrincipal UUID userId,
                                                      @Valid @RequestBody CreateTemplateRequest request) {
        return ResponseEntity.ok(templateService.createTemplate(userId, request));
    }

    @GetMapping
    public ResponseEntity<List<TemplateResponse>> getAll(@AuthenticationPrincipal UUID userId) {
        return ResponseEntity.ok(templateService.getUserTemplates(userId));
    }

    @GetMapping("/{templateId}")
    public ResponseEntity<TemplateResponse> getOne(@AuthenticationPrincipal UUID userId,
                                                      @PathVariable UUID templateId) {
        return ResponseEntity.ok(templateService.getTemplate(userId, templateId));
    }

    @PostMapping("/{templateId}/exercises")
    public ResponseEntity<TemplateResponse> addExercise(@AuthenticationPrincipal UUID userId,
                                                            @PathVariable UUID templateId,
                                                            @Valid @RequestBody AddTemplateExerciseRequest request) {
        return ResponseEntity.ok(templateService.addExercise(userId, templateId, request));
    }

    @DeleteMapping("/{templateId}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal UUID userId, @PathVariable UUID templateId) {
        templateService.deleteTemplate(userId, templateId);
        return ResponseEntity.noContent().build();
    }
}
