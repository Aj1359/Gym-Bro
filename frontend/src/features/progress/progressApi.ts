import axiosInstance from '../../api/axiosInstance';

export interface DataPoint {
  date: string;
  value: number;
}

export interface BodyMeasurement {
  weightKg: number | null;
  bodyFatPct: number | null;
  chestCm: number | null;
  waistCm: number | null;
  armsCm: number | null;
  neckCm: number | null;
  thighCm: number | null;
  calvesCm: number | null;
  loggedAt: string;
}

export interface ProgressOverview {
  weightTrend: DataPoint[];
  weightChangeKg: number | null;
  calorieTrend: DataPoint[];
  volumeTrend: DataPoint[];
  latestMeasurement: BodyMeasurement | null;
}

export interface LogMeasurementRequest {
  weightKg?: number;
  bodyFatPct?: number;
  chestCm?: number;
  waistCm?: number;
  armsCm?: number;
  neckCm?: number;
  thighCm?: number;
  calvesCm?: number;
}

export async function logMeasurement(data: LogMeasurementRequest): Promise<BodyMeasurement> {
  const response = await axiosInstance.post<BodyMeasurement>('/measurements', data);
  return response.data;
}

export async function getProgressOverview(days = 90): Promise<ProgressOverview> {
  const response = await axiosInstance.get<ProgressOverview>('/progress', { params: { days } });
  return response.data;
}

export async function getStrengthTrend(exerciseId: string): Promise<DataPoint[]> {
  const response = await axiosInstance.get<DataPoint[]>(`/progress/strength/${exerciseId}`);
  return response.data;
}
