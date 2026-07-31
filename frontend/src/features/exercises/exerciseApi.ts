import axiosInstance from '../../api/axiosInstance';

export interface Exercise {
    id: string;
    name: string;
    force: string | null;
    level: string;
    mechanic: string | null;
    equipment: string | null;
    primaryMuscles: string[];
    secondaryMuscles: string[];
    instructions: string[];
    category: string;
    images: string[];
}

interface ExercisePage {
    content: Exercise[];
    totalPages: number;
    totalElements: number;
    number: number;
}

export interface ExerciseFilters {
    muscle?: string;
    equipment?: string;
    level?: string;
    search?: string;
    page?: number;
    size?: number;
}

export async function getExercises(filters: ExerciseFilters = {}): Promise<ExercisePage> {
    const response = await axiosInstance.get<ExercisePage>('/exercises', { params: filters });
    return response.data;
}