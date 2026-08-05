package com.example.demo.nutrition;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.UUID;

public interface FoodRepository extends JpaRepository<Food, UUID> {

    @Query("""
        SELECT f FROM Food f
        WHERE (:category IS NULL OR f.category = :category)
        AND (:search IS NULL OR LOWER(f.name) LIKE LOWER(CONCAT('%', :search, '%')))
        """)
    Page<Food> search(@Param("category") String category, @Param("search") String search, Pageable pageable);
}
