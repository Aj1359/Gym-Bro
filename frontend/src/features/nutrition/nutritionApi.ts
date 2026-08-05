import axiosInstance from '../../api/axiosInstance';

export interface Food {
  id: string;
  name: string;
  category: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
}

export interface Meal {
  id: string;
  foodName: string;
  mealType: string;
  quantity: number;
  servingUnit: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  loggedAt: string;
}

export interface DailySummary {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  totalWaterMl: number;
  mealsByType: Record<string, Meal[]>;
}

interface FoodPage {
  content: Food[];
  totalPages: number;
}

export async function searchFoods(search: string): Promise<Food[]> {
  const response = await axiosInstance.get<FoodPage>('/nutrition/foods', { params: { search, size: 30 } });
  return response.data.content;
}

export async function logMeal(foodId: string, mealType: string, quantity: number): Promise<Meal> {
  const response = await axiosInstance.post<Meal>('/nutrition/meals', { foodId, mealType, quantity });
  return response.data;
}

export async function getDailySummary(date: string): Promise<DailySummary> {
  const response = await axiosInstance.get<DailySummary>('/nutrition/meals', { params: { date } });
  return response.data;
}

export async function deleteMeal(mealId: string): Promise<void> {
  await axiosInstance.delete(`/nutrition/meals/${mealId}`);
}

export async function toggleFavorite(foodId: string): Promise<void> {
  await axiosInstance.put(`/nutrition/foods/${foodId}/favorite`);
}

export async function getFavorites(): Promise<Food[]> {
  const response = await axiosInstance.get<Food[]>('/nutrition/foods/favorites');
  return response.data;
}

export async function getRecentFoods(): Promise<Food[]> {
  const response = await axiosInstance.get<Food[]>('/nutrition/foods/recent');
  return response.data;
}

export async function logWater(amountMl: number): Promise<{ totalMl: number }> {
  const response = await axiosInstance.post<{ totalMl: number }>('/nutrition/water', { amountMl });
  return response.data;
}
