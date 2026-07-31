package com.example.demo.workout.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public record StartWorkoutRequest(@NotBlank String title, UUID templateId) {}
