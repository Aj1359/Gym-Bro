package com.gymbro.progress;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;


@Entity
@Table(name = "body_measurements")
public class BodyMeasurements {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "weight_kg")
    private Double weightKg;
    
    @Column(name = "body_fat_pct")
    private Double bodyFatPct;
    
    @Column(name = "chest_cm")
    private Double chestCm;
    
    @Column(name = "waist_cm")
    private Double waistCm;
    
    @Column(name = "arms_cm")
    private Double armsCm;
    
    @Column(name = "neck_cm")
    private Double neckCm;
    
    @Column(name = "thigh_cm")
    private Double thighCm;
    
    @Column(name = "calves_cm")
    private Double calvesCm;
    
    @Column(name = "logged_at")
    private LocalDateTime loggedAt;
}
