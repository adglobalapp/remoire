import { type LoginCredentials, type RegisterCredentials, type User, type AuthResponse, type ApiError } from '../types';
import { API_BASE_URL, getHeaders } from './client';

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
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
    } catch (error) {
        throw error;
    }
};

export const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    try {
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
    } catch (error) {
        throw error;
    }
};

export const getCurrentUser = async (): Promise<User> => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: getHeaders(),
        });
        const data = await response.json();
        if (!response.ok) {
            const error = new Error('Unauthorized') as ApiError;
            error.status = response.status;
            throw error;
        }
        return data;
    } catch (error) {
        throw error;
    }
};

export const logout = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: getHeaders(),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || `Error: ${response.status}`);
        return data;
    } catch (error) {
        throw error;
    }
};
