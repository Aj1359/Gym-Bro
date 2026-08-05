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
import com.example.demo.user.User;

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
    public ResponseEntity<MealResponse> logMeal(@AuthenticationPrincipal User user,
                                                   @Valid @RequestBody LogMealRequest request) {
        return ResponseEntity.ok(nutritionService.logMeal(user.getId(), request));
    }

    @GetMapping("/meals")
    public ResponseEntity<DailyNutritionSummary> getDailySummary(
            @AuthenticationPrincipal User user,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(nutritionService.getDailySummary(user.getId(), date));
    }

    @DeleteMapping("/meals/{mealId}")
    public ResponseEntity<Void> deleteMeal(@AuthenticationPrincipal User user, @PathVariable UUID mealId) {
        nutritionService.deleteMeal(user.getId(), mealId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/foods/{foodId}/favorite")
    public ResponseEntity<Void> toggleFavorite(@AuthenticationPrincipal User user, @PathVariable UUID foodId) {
        nutritionService.toggleFavorite(user.getId(), foodId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/foods/favorites")
    public ResponseEntity<List<FoodResponse>> getFavorites(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(nutritionService.getFavorites(user.getId()));
    }

    @GetMapping("/foods/recent")
    public ResponseEntity<List<FoodResponse>> getRecent(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(nutritionService.getRecentFoods(user.getId()));
    }

    @PostMapping("/water")
    public ResponseEntity<WaterSummaryResponse> logWater(@AuthenticationPrincipal User user,
                                                            @Valid @RequestBody LogWaterRequest request) {
        return ResponseEntity.ok(nutritionService.logWater(user.getId(), request));
    }
}
