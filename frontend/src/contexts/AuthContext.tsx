import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import * as api from '../api/auth';
import { type User, type LoginCredentials, type RegisterCredentials, type AuthContextType, type ApiError } from '../types';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
    const [isLoading, setIsLoading] = useState(true);

    const logout = useCallback(async () => {
        let msg = 'Logged out';
        try {
            if (token || user) {
                const res = await api.logout();
                if (res?.message) msg = res.message;
            }
        } catch (error) {
            console.error('Logout API call failed:', error);
        } finally {
            setToken(null);
            setUser(null);
            localStorage.removeItem('auth_token');
            toast.success(msg, { id: 'logout-success' });
        }
    }, [token]);

    useEffect(() => {
        const initAuth = async () => {
            if (token) {
                try {
                    const userData = await api.getCurrentUser();
                    setUser(userData);
                } catch (err: unknown) {
                    const error = err as ApiError;
                    toast.error(error.message || 'Authentication failed', { id: 'auth-fail' });
                    if (error.status === 401) {
                        logout();
                    }
                }
            }
            setIsLoading(false);
        };
        initAuth();
    }, [token, logout]);

    const login = async (credentials: LoginCredentials) => {
        try {
            const data = await api.login(credentials);
            setToken(data.access_token);
            setUser(data.user);
            localStorage.setItem('auth_token', data.access_token);
            if (data.message) toast.success(data.message);
            return data;
        } catch (err: unknown) {
            const error = err as ApiError;
            if (error.status !== 422) {
                toast.error(error.message || 'Login failed');
            }
            throw error;
        }
    };

    const register = async (credentials: RegisterCredentials) => {
        try {
            const data = await api.register(credentials);
            setToken(data.access_token);
            setUser(data.user);
            localStorage.setItem('auth_token', data.access_token);
            if (data.message) toast.success(data.message);
            return data;
        } catch (err: unknown) {
            const error = err as ApiError;
            if (error.status !== 422) {
                toast.error(error.message || 'Registration failed');
            }
            throw error;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isLoading,
                login,
                register,
                logout,
                setUser,
                isAuthenticated: !!token && !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
