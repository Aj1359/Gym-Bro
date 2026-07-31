package com.example.demo.workout.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateTemplateRequest(@NotBlank String name) {}
