import axiosInstance from '../../api/axiosInstance';
import type { TemplateExercise } from '../templates/templateApi';

export interface WorkoutSet {
  id: string;
  exerciseId: string;
  setNumber: number;
  weightKg: number | null;
  reps: number;
  rpe: number | null;
  estimatedOneRepMax: number;
  isPersonalRecord: boolean;
}

export interface Workout {
  id: string;
  title: string;
  startedAt: string;
  completedAt: string | null;
  sets: WorkoutSet[];
  plannedExercises: TemplateExercise[];
  totalVolume: number;
}

export interface LogSetRequest {
  exerciseId: string;
  setNumber: number;
  weightKg?: number;
  reps: number;
  rpe?: number;
}

export async function startWorkout(title: string, templateId?: string): Promise<Workout> {
  const response = await axiosInstance.post<Workout>('/workouts', { title, templateId });
  return response.data;
}

export async function getWorkouts(): Promise<Workout[]> {
  const response = await axiosInstance.get<Workout[]>('/workouts');
  return response.data;
}

export async function getWorkout(workoutId: string): Promise<Workout> {
  const response = await axiosInstance.get<Workout>(`/workouts/${workoutId}`);
  return response.data;
}

export async function logSet(workoutId: string, set: LogSetRequest): Promise<Workout> {
  const response = await axiosInstance.post<Workout>(`/workouts/${workoutId}/sets`, set);
  return response.data;
}

export async function completeWorkout(workoutId: string): Promise<Workout> {
  const response = await axiosInstance.put<Workout>(`/workouts/${workoutId}/complete`, {});
  return response.data;
}
