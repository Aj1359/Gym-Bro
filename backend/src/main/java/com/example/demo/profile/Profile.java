package com.example.demo.profile;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "profiles")
public class Profile {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Column(nullable = false)
    private Integer age;

    @Column(name = "height_cm", nullable = false)
    private BigDecimal heightCm;

    @Column(name = "weight_kg", nullable = false)
    private BigDecimal weightKg;

    @Column(nullable = false)
    private String gender;

    @Column(nullable = false)
    private String goal;

    @Column(name = "activity_level", nullable = false)
    private String activityLevel;

    @Column(name = "experience_level", nullable = false)
    private String experienceLevel;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    protected Profile() {}

    public Profile(UUID userId, Integer age, BigDecimal heightCm, BigDecimal weightKg,
                   String gender, String goal, String activityLevel, String experienceLevel) {
        this.userId = userId;
        this.age = age;
        this.heightCm = heightCm;
        this.weightKg = weightKg;
        this.gender = gender;
        this.goal = goal;
        this.activityLevel = activityLevel;
        this.experienceLevel = experienceLevel;
    }

    // Getters
    public UUID getUserId() { return userId; }
    public Integer getAge() { return age; }
    public BigDecimal getHeightCm() { return heightCm; }
    public BigDecimal getWeightKg() { return weightKg; }
    public String getGender() { return gender; }
    public String getGoal() { return goal; }
    public String getActivityLevel() { return activityLevel; }
    public String getExperienceLevel() { return experienceLevel; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    // Setters (profile is updatable, unlike User)
    public void setAge(Integer age) { this.age = age; }
    public void setHeightCm(BigDecimal heightCm) { this.heightCm = heightCm; }
    public void setWeightKg(BigDecimal weightKg) { this.weightKg = weightKg; }
    public void setGender(String gender) { this.gender = gender; }
    public void setGoal(String goal) { this.goal = goal; }
    public void setActivityLevel(String activityLevel) { this.activityLevel = activityLevel; }
    public void setExperienceLevel(String experienceLevel) { this.experienceLevel = experienceLevel; }
    public void touchUpdatedAt() { this.updatedAt = LocalDateTime.now(); }
}
