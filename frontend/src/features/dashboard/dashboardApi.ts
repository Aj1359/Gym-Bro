import axiosInstance from '../../api/axiosInstance';

export interface MacroBreakdown {
  proteinPct: number;
  carbsPct: number;
  fatPct: number;
}

export interface RecentMeal {
  id: string;
  foodName: string;
  mealType: string;
  quantity: number;
  servingUnit: string;
  calories: number;
  loggedAt: string;
}

export interface RecentWorkout {
  id: string;
  title: string;
  startedAt: string;
  durationMinutes: number | null;
}

export interface Dashboard {
  currentWeightKg: number | null;
  caloriesConsumed: number; caloriesTarget: number | null;
  proteinConsumed: number; proteinTarget: number | null;
  carbsConsumed: number; carbsTarget: number | null;
  fatConsumed: number; fatTarget: number | null;
  waterConsumedMl: number; waterTargetMl: number | null;
  macroBreakdown: MacroBreakdown;
  todaysWorkout: { workoutId: string; title: string; completed: boolean } | null;
  weeklyConsistency: number;
  weeklyScores: number[];
  workoutStreak: number;
  dailyScore: number;
  recentMeals: RecentMeal[];
  recentWorkouts: RecentWorkout[];
}

export async function getDashboard(): Promise<Dashboard> {
  const response = await axiosInstance.get<Dashboard>('/dashboard');
  return response.data;
}
