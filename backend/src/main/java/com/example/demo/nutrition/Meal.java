package com.example.demo.nutrition;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "meals")
public class Meal {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "food_id", nullable = false)
    private UUID foodId;

    @Column(name = "meal_type", nullable = false)
    private String mealType;

    @Column(nullable = false)
    private BigDecimal quantity;

    @Column(name = "logged_at", nullable = false)
    private LocalDateTime loggedAt = LocalDateTime.now();

    protected Meal() {}

    public Meal(UUID userId, UUID foodId, String mealType, BigDecimal quantity) {
        this.userId = userId;
        this.foodId = foodId;
        this.mealType = mealType;
        this.quantity = quantity;
    }

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public UUID getFoodId() { return foodId; }
    public String getMealType() { return mealType; }
    public BigDecimal getQuantity() { return quantity; }
    public LocalDateTime getLoggedAt() { return loggedAt; }
}
