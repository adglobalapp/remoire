import { type User, type ApiError } from '../types';
import { API_BASE_URL, getHeaders } from './client';

export const updateProfile = async (data: { name: string; bio?: string; avatar_url?: string | null }) => {
    try {
        const response = await fetch(`${API_BASE_URL}/user/profile`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        const resData = await response.json();
        if (!response.ok) {
            const error = new Error(resData.message || 'Failed to update profile') as ApiError;
            error.status = response.status;
            error.errors = resData.errors;
            throw error;
        }
        return resData;
    } catch (error) {
        throw error;
    }
};

export const updatePassword = async (data: Record<string, string>) => {
    try {
        const response = await fetch(`${API_BASE_URL}/user/password`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        const resData = await response.json();
        if (!response.ok) {
            const error = new Error(resData.message || 'Failed to update password') as ApiError;
            error.status = response.status;
            error.errors = resData.errors;
            throw error;
        }
        return resData;
    } catch (error) {
        throw error;
    }
};

export const getBlockedUsers = async (): Promise<User[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/user/blocked`, {
            headers: getHeaders(),
        });
        if (!response.ok) return [];
        return await response.json();
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
