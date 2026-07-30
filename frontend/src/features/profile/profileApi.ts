import axiosInstance from '../../api/axiosInstance';

export interface GoalTargets {
  bmi: number;
  bmr: number;
  tdee: number;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fibreGrams: number;
  waterLitres: number;
}

export interface ProfileData {
  age: number;
  heightCm: number;
  weightKg: number;
  gender: string;
  goal: string;
  activityLevel: string;
  experienceLevel: string;
  targets: GoalTargets;
}

export interface ProfileRequest {
  age: number;
  heightCm: number;
  weightKg: number;
  gender: string;
  goal: string;
  activityLevel: string;
  experienceLevel: string;
}

/**
 * GET /profile — returns the authenticated user's profile + computed targets.
 *
 * Uses axiosInstance (not plain axios) because this endpoint requires an access token
 * and benefits from automatic token refresh on 401 — both wired up in axiosInstance.
 */
export async function getProfile(): Promise<ProfileData> {
  const response = await axiosInstance.get<ProfileData>('/profile');
  return response.data;
}

/**
 * PUT /profile — creates or updates the profile and returns the updated data + targets.
 */
export async function updateProfile(data: ProfileRequest): Promise<ProfileData> {
  const response = await axiosInstance.put<ProfileData>('/profile', data);
  return response.data;
}
