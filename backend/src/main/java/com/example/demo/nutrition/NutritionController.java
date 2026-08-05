package com.example.demo.nutrition;

import com.example.demo.nutrition.dto.*;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/nutrition")
public class NutritionController {

    private final NutritionService nutritionService;

    public NutritionController(NutritionService nutritionService) {
        this.nutritionService = nutritionService;
    }

    @GetMapping("/foods")
    public ResponseEntity<Page<FoodResponse>> searchFoods(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 30) Pageable pageable) {
        return ResponseEntity.ok(nutritionService.searchFoods(category, search, pageable));
    }

    @PostMapping("/meals")
    public ResponseEntity<MealResponse> logMeal(@AuthenticationPrincipal UUID userId,
                                                   @Valid @RequestBody LogMealRequest request) {
        return ResponseEntity.ok(nutritionService.logMeal(userId, request));
    }

    @GetMapping("/meals")
    public ResponseEntity<DailyNutritionSummary> getDailySummary(
            @AuthenticationPrincipal UUID userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(nutritionService.getDailySummary(userId, date));
    }

    @DeleteMapping("/meals/{mealId}")
    public ResponseEntity<Void> deleteMeal(@AuthenticationPrincipal UUID userId, @PathVariable UUID mealId) {
        nutritionService.deleteMeal(userId, mealId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/foods/{foodId}/favorite")
    public ResponseEntity<Void> toggleFavorite(@AuthenticationPrincipal UUID userId, @PathVariable UUID foodId) {
        nutritionService.toggleFavorite(userId, foodId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/foods/favorites")
    public ResponseEntity<List<FoodResponse>> getFavorites(@AuthenticationPrincipal UUID userId) {
        return ResponseEntity.ok(nutritionService.getFavorites(userId));
    }

    @GetMapping("/foods/recent")
    public ResponseEntity<List<FoodResponse>> getRecent(@AuthenticationPrincipal UUID userId) {
        return ResponseEntity.ok(nutritionService.getRecentFoods(userId));
    }

    @PostMapping("/water")
    public ResponseEntity<WaterSummaryResponse> logWater(@AuthenticationPrincipal UUID userId,
                                                            @Valid @RequestBody LogWaterRequest request) {
        return ResponseEntity.ok(nutritionService.logWater(userId, request));
    }
}

