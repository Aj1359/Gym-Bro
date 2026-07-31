import axiosInstance from '../../api/axiosInstance';

export interface TemplateExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  imageUrl: string | null;
  instructions: string[];
  targetSets: number;
  targetReps: number;
  targetWeightKg: number | null;
}

export interface Template {
  id: string;
  name: string;
  displayOrder: number;
  exercises: TemplateExercise[];
}

export async function createTemplate(name: string): Promise<Template> {
  const response = await axiosInstance.post<Template>('/templates', { name });
  return response.data;
}

export async function getTemplates(): Promise<Template[]> {
  const response = await axiosInstance.get<Template[]>('/templates');
  return response.data;
}

export async function addExerciseToTemplate(
  templateId: string,
  data: { exerciseId: string; targetSets: number; targetReps: number; targetWeightKg?: number }
): Promise<Template> {
  const response = await axiosInstance.post<Template>(`/templates/${templateId}/exercises`, data);
  return response.data;
}

export async function deleteTemplate(templateId: string): Promise<void> {
  await axiosInstance.delete(`/templates/${templateId}`);
}
