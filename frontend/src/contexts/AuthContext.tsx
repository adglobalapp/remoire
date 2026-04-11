import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import * as api from '../api/auth';
import { type User, type LoginCredentials, type RegisterCredentials, type AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            if (token) {
                try {
                    const userData = await api.getCurrentUser();
                    setUser(userData);
                } catch (error: any) {
                    toast.error('Authentication failed');
                    if (error.status === 401) {
                        logout();
                    }
                }
            }
            setIsLoading(false);
        };
        initAuth();
    }, [token]);

    const login = async (credentials: LoginCredentials) => {
        try {
            const data = await api.login(credentials);
            setToken(data.access_token);
            setUser(data.user);
            localStorage.setItem('auth_token', data.access_token);
            toast.success('Logged in');
            return data;
        } catch (error: any) {
            toast.error(error.message || 'Login failed');
            throw error;
        }
    };

    const register = async (credentials: RegisterCredentials) => {
        try {
            const data = await api.register(credentials);
            setToken(data.access_token);
            setUser(data.user);
            localStorage.setItem('auth_token', data.access_token);
            toast.success('Registered');
            return data;
        } catch (error: any) {
            toast.error(error.message || 'Registration failed');
            throw error;
        }
    };

    const logout = () => {
        if (!token && !user) return;
        setToken(null);
        setUser(null);
        localStorage.removeItem('auth_token');
        toast.success('Logged out', { id: 'logout-success' });
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
