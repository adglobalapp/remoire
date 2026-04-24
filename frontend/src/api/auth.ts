import { type LoginCredentials, type RegisterCredentials, type User, type AuthResponse, type ApiError } from '../types';
import { API_BASE_URL, getHeaders } from './client';

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(credentials),
    });
    const data = await response.json();
    if (!response.ok) {
        const error = new Error(data.message || 'Login failed') as ApiError;
        error.status = response.status;
        error.errors = data.errors;
        throw error;
    }
    return data;
};

export const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(credentials),
    });
    const data = await response.json();
    if (!response.ok) {
        const error = new Error(data.message || 'Registration failed') as ApiError;
        error.status = response.status;
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
        const error = new Error('Unauthorized') as ApiError;
        error.status = response.status;
        throw error;
    }
    return await response.json();
};

export const logout = async (): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: getHeaders(),
    });
    if (!response.ok) {
        throw new Error('Logout failed');
    }
};
