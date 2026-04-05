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

export interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<any>;
    register: (credentials: RegisterCredentials) => Promise<any>;
    logout: () => void;
    isAuthenticated: boolean;
}
