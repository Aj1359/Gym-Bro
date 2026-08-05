package com.example.demo.nutrition;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface FavoriteFoodRepository extends JpaRepository<FavoriteFood, FavoriteFood.FavoriteFoodId> {
    List<FavoriteFood> findByUserId(UUID userId);
    void deleteByUserIdAndFoodId(UUID userId, UUID foodId);
    boolean existsByUserIdAndFoodId(UUID userId, UUID foodId);
}
