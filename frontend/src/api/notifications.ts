import { API_BASE_URL, getHeaders } from './client';
import { type Notification } from '../types';

export const getNotifications = async (): Promise<Notification[]> => {
    const res = await fetch(`${API_BASE_URL}/notifications`, {
        headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch notifications');
    return data;
};

export const markAsRead = async (id: number) => {
    const res = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to mark as read');
    return data;
};

export const deleteNotification = async (id: number) => {
    const res = await fetch(`${API_BASE_URL}/notifications/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete notification');
    return data;
};
