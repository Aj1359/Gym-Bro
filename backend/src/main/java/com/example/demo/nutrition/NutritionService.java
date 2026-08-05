package com.example.demo.nutrition;

import com.example.demo.nutrition.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class NutritionService {

    private final FoodRepository foodRepository;
    private final MealRepository mealRepository;
    private final FavoriteFoodRepository favoriteFoodRepository;
    private final WaterLogRepository waterLogRepository;

    public NutritionService(FoodRepository foodRepository, MealRepository mealRepository,
                             FavoriteFoodRepository favoriteFoodRepository, WaterLogRepository waterLogRepository) {
        this.foodRepository = foodRepository;
        this.mealRepository = mealRepository;
        this.favoriteFoodRepository = favoriteFoodRepository;
        this.waterLogRepository = waterLogRepository;
    }

    public Page<FoodResponse> searchFoods(String category, String search, Pageable pageable) {
        return foodRepository.search(category, search, pageable).map(this::toFoodResponse);
    }

    @Transactional
    public MealResponse logMeal(UUID userId, LogMealRequest request) {
        Food food = foodRepository.findById(request.foodId())
                .orElseThrow(() -> new IllegalArgumentException("Food not found"));
        Meal meal = new Meal(userId, food.getId(), request.mealType(), request.quantity());
        meal = mealRepository.save(meal);
        return toMealResponse(meal, food);
    }

    public DailyNutritionSummary getDailySummary(UUID userId, LocalDate date) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.plusDays(1).atStartOfDay();

        List<MealResponse> mealResponses = mealRepository
                .findByUserIdAndLoggedAtBetweenOrderByLoggedAtAsc(userId, start, end)
                .stream()
                .map(m -> toMealResponse(m, foodRepository.findById(m.getFoodId())
                        .orElseThrow(() -> new IllegalStateException("Referenced food missing"))))
                .collect(Collectors.toList());

        Map<String, List<MealResponse>> grouped = new LinkedHashMap<>();
        for (String type : List.of("breakfast", "lunch", "dinner", "snack")) {
            grouped.put(type, mealResponses.stream()
                    .filter(m -> m.mealType().equals(type))
                    .collect(Collectors.toList()));
        }

        int totalWaterMl = waterLogRepository.findByUserIdAndLoggedAtBetween(userId, start, end)
                .stream().mapToInt(WaterLog::getAmountMl).sum();

        return new DailyNutritionSummary(
                sum(mealResponses, MealResponse::calories), sum(mealResponses, MealResponse::proteinG),
                sum(mealResponses, MealResponse::carbsG), sum(mealResponses, MealResponse::fatG),
                sum(mealResponses, MealResponse::fiberG), totalWaterMl, grouped
        );
    }

    @Transactional
    public void deleteMeal(UUID userId, UUID mealId) {
        Meal meal = mealRepository.findById(mealId)
                .orElseThrow(() -> new IllegalArgumentException("Meal not found"));
        if (!meal.getUserId().equals(userId)) throw new IllegalArgumentException("Meal not found");
        mealRepository.delete(meal);
    }

    @Transactional
    public void toggleFavorite(UUID userId, UUID foodId) {
        if (favoriteFoodRepository.existsByUserIdAndFoodId(userId, foodId)) {
            favoriteFoodRepository.deleteByUserIdAndFoodId(userId, foodId);
        } else {
            foodRepository.findById(foodId).orElseThrow(() -> new IllegalArgumentException("Food not found"));
            favoriteFoodRepository.save(new FavoriteFood(userId, foodId));
        }
    }

    public List<FoodResponse> getFavorites(UUID userId) {
        return favoriteFoodRepository.findByUserId(userId).stream()
                .map(fav -> foodRepository.findById(fav.getFoodId()).orElseThrow())
                .map(this::toFoodResponse)
                .collect(Collectors.toList());
    }

    public List<FoodResponse> getRecentFoods(UUID userId) {
        return mealRepository.findByUserIdAndLoggedAtBetweenOrderByLoggedAtAsc(
                        userId, LocalDateTime.now().minusDays(14), LocalDateTime.now())
                .stream()
                .sorted(Comparator.comparing(Meal::getLoggedAt).reversed())
                .map(Meal::getFoodId)
                .distinct()
                .limit(10)
                .map(id -> foodRepository.findById(id).orElseThrow())
                .map(this::toFoodResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public WaterSummaryResponse logWater(UUID userId, LogWaterRequest request) {
        waterLogRepository.save(new WaterLog(userId, request.amountMl()));
        return getWaterSummary(userId, LocalDate.now());
    }

    public WaterSummaryResponse getWaterSummary(UUID userId, LocalDate date) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.plusDays(1).atStartOfDay();
        int total = waterLogRepository.findByUserIdAndLoggedAtBetween(userId, start, end)
                .stream().mapToInt(WaterLog::getAmountMl).sum();
        return new WaterSummaryResponse(total);
    }

    private FoodResponse toFoodResponse(Food f) {
        return new FoodResponse(f.getId(), f.getName(), f.getCategory(), f.getServingSize(), f.getServingUnit(),
                f.getCalories(), f.getProteinG(), f.getCarbsG(), f.getFatG(), f.getFiberG());
    }

    private MealResponse toMealResponse(Meal meal, Food food) {
        BigDecimal scale = meal.getQuantity().divide(food.getServingSize(), 4, RoundingMode.HALF_UP);
        return new MealResponse(meal.getId(), food.getName(), meal.getMealType(), meal.getQuantity(),
                food.getServingUnit(), scaled(food.getCalories(), scale), scaled(food.getProteinG(), scale),
                scaled(food.getCarbsG(), scale), scaled(food.getFatG(), scale), scaled(food.getFiberG(), scale),
                meal.getLoggedAt());
    }

    private BigDecimal scaled(BigDecimal value, BigDecimal scale) {
        return value.multiply(scale).setScale(1, RoundingMode.HALF_UP);
    }

    private BigDecimal sum(List<MealResponse> meals, java.util.function.Function<MealResponse, BigDecimal> extractor) {
        return meals.stream().map(extractor).reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
