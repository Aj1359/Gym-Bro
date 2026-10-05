import axiosInstance from '../../api/axiosInstance';

export interface StationInput {
  stationName: string;
  orderIndex: number;
  plannedType: 'time' | 'reps';
  plannedTarget: number;
  plannedRestSeconds?: number;
}

export interface CreateCircuitRequest {
  title: string;
  overallNotes?: string;
  stations: StationInput[];
}

export interface LogStationRequest {
  actualValue?: number;
  actualNotes?: string;
}

export interface StationResponse {
  id: string;
  circuitSessionId: string;
  stationName: string;
  orderIndex: number;
  plannedType: 'time' | 'reps';
  plannedTarget: number;
  plannedRestSeconds: number;
  actualValue?: number | null;
  actualNotes?: string | null;
}

export interface AiReportResponse {
  circuitSessionId: string;
  planQualityScore: number;
  adherenceScore: number;
  overallScore: number;
  summaryFeedback: string;
  generatedAt: string;
}

export interface CircuitSession {
  id: string;
  userId: string;
  title: string;
  overallNotes?: string | null;
  status: 'planned' | 'completed';
  sessionDate: string;
  completedAt?: string | null;
  createdAt: string;
  stations: StationResponse[];
  aiReport?: AiReportResponse | null;
}

export async function createCircuit(request: CreateCircuitRequest): Promise<CircuitSession> {
  const response = await axiosInstance.post<CircuitSession>('/circuits', request);
  return response.data;
}

export async function getCircuits(): Promise<CircuitSession[]> {
  const response = await axiosInstance.get<CircuitSession[]>('/circuits');
  return response.data;
}

export async function getCircuit(id: string): Promise<CircuitSession> {
  const response = await axiosInstance.get<CircuitSession>(`/circuits/${id}`);
  return response.data;
}

export async function logStation(
  circuitId: string,
  stationId: string,
  request: LogStationRequest
): Promise<CircuitSession> {
  const response = await axiosInstance.post<CircuitSession>(
    `/circuits/${circuitId}/stations/${stationId}`,
    request
  );
  return response.data;
}

export async function completeCircuit(
  circuitId: string,
  overallNotes?: string
): Promise<CircuitSession> {
  const response = await axiosInstance.post<CircuitSession>(`/circuits/${circuitId}/complete`, {
    overallNotes,
  });
  return response.data;
}
