package com.example.demo.progress.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DataPoint(LocalDate date, BigDecimal value) {}
