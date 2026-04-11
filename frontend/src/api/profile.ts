import { type User } from '../types';
import { API_BASE_URL, getHeaders } from './client';

export const updateProfile = async (data: { name: string; bio?: string; avatar_url?: string }) => {
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const errData = await response.json();
        const error = new Error(errData.message || 'Failed to update profile') as any;
        error.status = response.status;
        error.errors = errData.errors;
        throw error;
    }
    return await response.json();
};

export const updatePassword = async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/user/password`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const errData = await response.json();
        const error = new Error(errData.message || 'Failed to update password') as any;
        error.status = response.status;
        error.errors = errData.errors;
        throw error;
    }
    return await response.json();
};

export const getBlockedUsers = async (): Promise<User[]> => {
    const response = await fetch(`${API_BASE_URL}/user/blocked`, {
        headers: getHeaders(),
    });
    if (!response.ok) return [];
    return await response.json();
};

export const unblockUser = async (userId: number) => {
    const response = await fetch(`${API_BASE_URL}/user/blocked/${userId}`, {
        method: 'DELETE',
        headers: getHeaders(),
    });
    if (!response.ok) {
        throw new Error('Failed to unblock user');
    }
    return await response.json();
};
