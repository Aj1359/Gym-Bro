import axiosInstance from '../../api/axiosInstance';

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export async function getNotifications(): Promise<Notification[]> {
  const response = await axiosInstance.get<Notification[]>('/notifications');
  return response.data;
}

export async function getUnreadCount(): Promise<number> {
  const response = await axiosInstance.get<{ count: number }>('/notifications/unread-count');
  return response.data.count;
}

export async function markAsRead(id: string): Promise<void> {
  await axiosInstance.put(`/notifications/${id}/read`);
}
