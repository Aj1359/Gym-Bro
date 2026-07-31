package com.example.demo.workout;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "workout_day_templates")
public class WorkoutDayTemplate {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String name;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    protected WorkoutDayTemplate() {}

    public WorkoutDayTemplate(UUID userId, String name, Integer displayOrder) {
        this.userId = userId;
        this.name = name;
        this.displayOrder = displayOrder;
    }

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public String getName() { return name; }
    public Integer getDisplayOrder() { return displayOrder; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setName(String name) { this.name = name; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
}
