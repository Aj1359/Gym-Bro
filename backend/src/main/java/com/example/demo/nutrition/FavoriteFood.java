package com.example.demo.nutrition;

import jakarta.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "favorite_foods")
@IdClass(FavoriteFood.FavoriteFoodId.class)
public class FavoriteFood {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Id
    @Column(name = "food_id")
    private UUID foodId;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    protected FavoriteFood() {}

    public FavoriteFood(UUID userId, UUID foodId) {
        this.userId = userId;
        this.foodId = foodId;
    }

    public UUID getUserId() { return userId; }
    public UUID getFoodId() { return foodId; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public static class FavoriteFoodId implements Serializable {
        private UUID userId;
        private UUID foodId;

        public FavoriteFoodId() {}
        public FavoriteFoodId(UUID userId, UUID foodId) {
            this.userId = userId;
            this.foodId = foodId;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof FavoriteFoodId that)) return false;
            return Objects.equals(userId, that.userId) && Objects.equals(foodId, that.foodId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(userId, foodId);
        }
    }
}
