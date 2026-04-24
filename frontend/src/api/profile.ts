import { type User } from '../types';
import { API_BASE_URL, getHeaders } from './client';

export const updateProfile = async (data: { name: string; bio?: string; avatar_url?: string | null }) => {
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const errData = await response.json();
        let errorMessage = errData.message || 'Failed to update profile';
        if (errData.errors) {
            errorMessage = Object.values(errData.errors).flat().join(' ');
        }
        const error = new Error(errorMessage) as any;
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
        let errorMessage = errData.message || 'Failed to update password';
        if (errData.errors) {
            errorMessage = Object.values(errData.errors).flat().join(' ');
        }
        const error = new Error(errorMessage) as any;
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
