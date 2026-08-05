package com.example.demo.nutrition;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "foods")
public class Food {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String category;

    @Column(name = "serving_size", nullable = false)
    private BigDecimal servingSize;

    @Column(name = "serving_unit", nullable = false)
    private String servingUnit;

    @Column(nullable = false)
    private BigDecimal calories;

    @Column(name = "protein_g", nullable = false)
    private BigDecimal proteinG;

    @Column(name = "carbs_g", nullable = false)
    private BigDecimal carbsG;

    @Column(name = "fat_g", nullable = false)
    private BigDecimal fatG;

    @Column(name = "fiber_g", nullable = false)
    private BigDecimal fiberG;

    protected Food() {}

    public UUID getId() { return id; }
    public String getName() { return name; }
    public String getCategory() { return category; }
    public BigDecimal getServingSize() { return servingSize; }
    public String getServingUnit() { return servingUnit; }
    public BigDecimal getCalories() { return calories; }
    public BigDecimal getProteinG() { return proteinG; }
    public BigDecimal getCarbsG() { return carbsG; }
    public BigDecimal getFatG() { return fatG; }
    public BigDecimal getFiberG() { return fiberG; }
}
