package com.example.demo.workout;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "workouts")
public class Workout {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String title;

    @Column(name = "started_at", nullable = false)
    private LocalDateTime startedAt = LocalDateTime.now();

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "template_id")
    private UUID templateId;

    protected Workout() {}

    public Workout(UUID userId, String title) {
        this.userId = userId;
        this.title = title;
    }

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public String getTitle() { return title; }
    public LocalDateTime getStartedAt() { return startedAt; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public UUID getTemplateId() { return templateId; }

    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
    public void setTemplateId(UUID templateId) { this.templateId = templateId; }

    public void complete() { this.completedAt = LocalDateTime.now(); }
}
