import { type LoginCredentials, type RegisterCredentials, type User } from '../types';
import { API_BASE_URL, getHeaders } from './client';

export const login = async (credentials: LoginCredentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(credentials),
    });
    const data = await response.json();
    if (!response.ok) {
        const error = new Error(data.message || 'Login failed') as any;
        error.errors = data.errors;
        throw error;
    }
    return data;
};

export const register = async (credentials: RegisterCredentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(credentials),
    });
    const data = await response.json();
    if (!response.ok) {
        const error = new Error(data.message || 'Registration failed') as any;
        error.errors = data.errors;
        throw error;
    }
    return data;
};

export const getCurrentUser = async (): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: getHeaders(),
    });
    if (!response.ok) {
        const error = new Error('Unauthorized') as any;
        error.status = response.status;
        throw error;
    }
    return await response.json();
};
