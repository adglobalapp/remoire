import { type ReactNode } from 'react';
import { type User } from './models';

export interface LoginCredentials {
    email: string;
    password?: string;
}

export interface RegisterCredentials {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export interface AuthResponse {
    user: User;
    access_token: string;
    message?: string;
}

export interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<AuthResponse>;
    register: (credentials: RegisterCredentials) => Promise<AuthResponse>;
    logout: () => Promise<void>;
    setUser: (user: User | null) => void;
    isAuthenticated: boolean;
}

export interface AuthProviderProps {
    children: ReactNode;
}
