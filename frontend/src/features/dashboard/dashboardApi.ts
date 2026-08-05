import axiosInstance from '../../api/axiosInstance';

export interface TodaysWorkout {
  workoutId: string;
  title: string;
  completed: boolean;
}

export interface Dashboard {
  currentWeightKg: number | null;
  caloriesConsumed: number;
  caloriesTarget: number | null;
  proteinConsumed: number;
  proteinTarget: number | null;
  waterConsumedMl: number;
  waterTargetMl: number | null;
  todaysWorkout: TodaysWorkout | null;
  weeklyConsistency: number;
  workoutStreak: number;
}

export async function getDashboard(): Promise<Dashboard> {
  const response = await axiosInstance.get<Dashboard>('/dashboard');
  return response.data;
}
