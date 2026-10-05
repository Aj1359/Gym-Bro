package com.example.demo.circuit;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "circuit_sessions")
public class CircuitSession {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(name = "overall_notes", length = 500)
    private String overallNotes;

    @Column(nullable = false, length = 20)
    private String status = "planned";

    @Column(name = "session_date", nullable = false)
    private LocalDate sessionDate = LocalDate.now();

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    protected CircuitSession() {}

    public CircuitSession(UUID userId, String title, String overallNotes) {
        this.userId = userId;
        this.title = title;
        this.overallNotes = overallNotes;
        this.status = "planned";
        this.sessionDate = LocalDate.now();
        this.createdAt = LocalDateTime.now();
    }

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public String getTitle() { return title; }
    public String getOverallNotes() { return overallNotes; }
    public String getStatus() { return status; }
    public LocalDate getSessionDate() { return sessionDate; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public void complete(String notes) {
        if (notes != null && !notes.isBlank()) {
            this.overallNotes = notes;
        }
        this.status = "completed";
        this.completedAt = LocalDateTime.now();
    }
}
