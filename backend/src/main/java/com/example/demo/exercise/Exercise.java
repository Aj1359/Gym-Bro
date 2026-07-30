package com.example.demo.exercise;

import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "exercises")
public class Exercise {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(name = "force")
    private String force;

    @Column(nullable = false)
    private String level;

    @Column(name = "mechanic")
    private String mechanic;

    @Column(name = "equipment")
    private String equipment;

    @Column(name = "primary_muscles", columnDefinition = "text[]", nullable = false)
    private String[] primaryMuscles;

    @Column(name = "secondary_muscles", columnDefinition = "text[]")
    private String[] secondaryMuscles;

    @Column(name = "instructions", columnDefinition = "text[]", nullable = false)
    private String[] instructions;

    @Column(nullable = false)
    private String category;

    @Column(name = "images", columnDefinition = "text[]")
    private String[] images;

    protected Exercise() {
    }

    public Exercise(String name, String force, String level, String mechanic, String equipment, String[] primaryMuscles, String[] secondaryMuscles, String[] instructions, String category, String[] images) {
        this.name = name;
        this.force = force;
        this.level = level;
        this.mechanic = mechanic;
        this.equipment = equipment;
        this.primaryMuscles = primaryMuscles;
        this.secondaryMuscles = secondaryMuscles;
        this.instructions = instructions;
        this.category = category;
        this.images = images;
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getForce() {
        return force;
    }

    public String getLevel() {
        return level;
    }

    public String getMechanic() {
        return mechanic;
    }

    public String getEquipment() {
        return equipment;
    }

    public String[] getPrimaryMuscles() {
        return primaryMuscles;
    }

    public String[] getSecondaryMuscles() {
        return secondaryMuscles;
    }

    public String[] getInstructions() {
        return instructions;
    }

    public String getCategory() {
        return category;
    }

    public String[] getImages() {
        return images;
    }
}
