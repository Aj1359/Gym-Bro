package com.example.demo.nutrition.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record LogWaterRequest(@NotNull @Min(1) Integer amountMl) {}
