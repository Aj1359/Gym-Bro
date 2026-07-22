import axios from 'axios';

const AUTH_BASE_URL = 'http://localhost:8080/auth';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export async function registerUser(email: string, password: string): Promise<AuthResponse> {
  const response = await axios.post<AuthResponse>(`${AUTH_BASE_URL}/register`, { email, password });
  return response.data;
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const response = await axios.post<AuthResponse>(`${AUTH_BASE_URL}/login`, { email, password });
  return response.data;
}

export async function logoutUser(refreshToken: string): Promise<void> {
  await axios.post(`${AUTH_BASE_URL}/logout`, { refreshToken });
}
