import { type LoginCredentials, type RegisterCredentials, type User, type AuthResponse, type ApiError } from '../types';
import { API_BASE_URL, getHeaders } from './client';

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(credentials),
    });
    const data = await res.json();
    if (!res.ok) {
        const error = new Error(data.message || 'Login failed') as ApiError;
        error.status = res.status;
        error.errors = data.errors;
        throw error;
    }
    return data;
};

export const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(credentials),
    });
    const data = await res.json();
    if (!res.ok) {
        const error = new Error(data.message || 'Registration failed') as ApiError;
        error.status = res.status;
        error.errors = data.errors;
        throw error;
    }
    return data;
};

export const getCurrentUser = async (): Promise<User> => {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) {
        const error = new Error('Unauthorized') as ApiError;
        error.status = res.status;
        throw error;
    }
    return data;
};

export const logout = async () => {
    const res = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `Error: ${res.status}`);
    return data;
};
