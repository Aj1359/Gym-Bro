package com.example.demo.progress;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "body_measurements")
public class BodyMeasurement {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "weight_kg")
    private BigDecimal weightKg;

    @Column(name = "body_fat_pct")
    private BigDecimal bodyFatPct;

    @Column(name = "chest_cm")
    private BigDecimal chestCm;

    @Column(name = "waist_cm")
    private BigDecimal waistCm;

    @Column(name = "arms_cm")
    private BigDecimal armsCm;

    @Column(name = "neck_cm")
    private BigDecimal neckCm;

    @Column(name = "thigh_cm")
    private BigDecimal thighCm;

    @Column(name = "calves_cm")
    private BigDecimal calvesCm;

    @Column(name = "logged_at", nullable = false)
    private LocalDateTime loggedAt = LocalDateTime.now();

    protected BodyMeasurement() {}

    public BodyMeasurement(UUID userId, BigDecimal weightKg, BigDecimal bodyFatPct, BigDecimal chestCm,
                            BigDecimal waistCm, BigDecimal armsCm, BigDecimal neckCm,
                            BigDecimal thighCm, BigDecimal calvesCm) {
        this.userId = userId;
        this.weightKg = weightKg;
        this.bodyFatPct = bodyFatPct;
        this.chestCm = chestCm;
        this.waistCm = waistCm;
        this.armsCm = armsCm;
        this.neckCm = neckCm;
        this.thighCm = thighCm;
        this.calvesCm = calvesCm;
    }

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public BigDecimal getWeightKg() { return weightKg; }
    public BigDecimal getBodyFatPct() { return bodyFatPct; }
    public BigDecimal getChestCm() { return chestCm; }
    public BigDecimal getWaistCm() { return waistCm; }
    public BigDecimal getArmsCm() { return armsCm; }
    public BigDecimal getNeckCm() { return neckCm; }
    public BigDecimal getThighCm() { return thighCm; }
    public BigDecimal getCalvesCm() { return calvesCm; }
    public LocalDateTime getLoggedAt() { return loggedAt; }
}
