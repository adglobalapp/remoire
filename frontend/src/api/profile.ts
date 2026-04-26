import { type User, type ApiError } from '../types';
import { API_BASE_URL, getHeaders } from './client';

export const updateProfile = async (payload: { name: string; bio?: string; avatar_url?: string | null }) => {
    try {
        const response = await fetch(`${API_BASE_URL}/user/profile`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) {
            const error = new Error(data.message || 'Failed to update profile') as ApiError;
            error.status = response.status;
            error.errors = data.errors;
            throw error;
        }
        return data;
    } catch (error) {
        throw error;
    }
};

export const updatePassword = async (payload: Record<string, string>) => {
    try {
        const response = await fetch(`${API_BASE_URL}/user/password`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) {
            const error = new Error(data.message || 'Failed to update password') as ApiError;
            error.status = response.status;
            error.errors = data.errors;
            throw error;
        }
        return data;
    } catch (error) {
        throw error;
    }
};

export const getBlockedUsers = async (): Promise<User[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/user/blocked`, {
            headers: getHeaders(),
        });
        const data = await response.json();
        if (!response.ok) return [];
        return data;
    } catch {
        return [];
    }
};

export const unblockUser = async (userId: number) => {
    try {
        const response = await fetch(`${API_BASE_URL}/user/blocked/${userId}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || `Error: ${response.status}`);
        return data;
    } catch (error) {
        throw error;
    }
};
