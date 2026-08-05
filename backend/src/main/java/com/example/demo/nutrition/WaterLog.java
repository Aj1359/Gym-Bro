package com.example.demo.nutrition;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "water_logs")
public class WaterLog {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "amount_ml", nullable = false)
    private Integer amountMl;

    @Column(name = "logged_at", nullable = false)
    private LocalDateTime loggedAt = LocalDateTime.now();

    protected WaterLog() {}

    public WaterLog(UUID userId, Integer amountMl) {
        this.userId = userId;
        this.amountMl = amountMl;
    }

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public Integer getAmountMl() { return amountMl; }
    public LocalDateTime getLoggedAt() { return loggedAt; }
}
