package com.example.demo.workout.dto;

import java.util.List;
import java.util.UUID;

public record TemplateResponse(UUID id, String name, Integer displayOrder, List<TemplateExerciseResponse> exercises) {}
