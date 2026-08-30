package com.example.demo.notification.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record NotificationResponse(UUID id, String title, String body, String type, boolean read, LocalDateTime createdAt) {}
