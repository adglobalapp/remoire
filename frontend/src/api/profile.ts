import { type User, type ApiError } from '../types';
import { API_BASE_URL, getHeaders } from './client';

export const updateProfile = async (payload: { name: string; bio?: string; avatar_url?: string | null }) => {
    const res = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
        const error = new Error(data.message || 'Failed to update profile') as ApiError;
        error.status = res.status;
        error.errors = data.errors;
        throw error;
    }
    return data;
};

export const updatePassword = async (payload: Record<string, string>) => {
    const res = await fetch(`${API_BASE_URL}/user/password`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
        const error = new Error(data.message || 'Failed to update password') as ApiError;
        error.status = res.status;
        error.errors = data.errors;
        throw error;
    }
    return data;
};

export const getBlockedUsers = async (): Promise<User[]> => {
    const res = await fetch(`${API_BASE_URL}/user/blocked`, {
        headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `Error: ${res.status}`);
    return data;
};

export const unblockUser = async (userId: number) => {
    const res = await fetch(`${API_BASE_URL}/user/blocked/${userId}`, {
        method: 'DELETE',
        headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `Error: ${res.status}`);
    return data;
};
