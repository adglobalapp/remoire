import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Login from '../components/auth/Login';
import { AuthContext } from '../contexts/AuthContext';
import { type AuthContextType } from '../types';

const mockLogin = vi.fn();

const mockAuthContextValue: AuthContextType = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    login: mockLogin,
    logout: vi.fn(),
    register: vi.fn(),
    setUser: vi.fn(),
};

describe('Login Component', () => {
    const onClose = vi.fn();
    const onSwitchToRegister = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders correctly', () => {
        render(
            <AuthContext.Provider value={mockAuthContextValue}>
                <Login onClose={onClose} onSwitchToRegister={onSwitchToRegister} />
            </AuthContext.Provider>,
        );

        expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    });

    it('calls login with form data on submit', async () => {
        mockLogin.mockResolvedValue({ user: { name: 'Test' } });

        render(
            <AuthContext.Provider value={mockAuthContextValue}>
                <Login onClose={onClose} onSwitchToRegister={onSwitchToRegister} />
            </AuthContext.Provider>,
        );

        fireEvent.change(screen.getByLabelText(/Email/i), {
            target: { value: 'test@example.com' },
        });
        fireEvent.change(screen.getByLabelText(/Password/i), {
            target: { value: 'password123' },
        });
        fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password123',
            });
        });

        expect(onClose).toHaveBeenCalled();
    });

    it('displays errors from server', async () => {
        mockLogin.mockRejectedValue({
            status: 422,
            errors: { email: ['Invalid email format'] },
        });

        render(
            <AuthContext.Provider value={mockAuthContextValue}>
                <Login onClose={onClose} onSwitchToRegister={onSwitchToRegister} />
            </AuthContext.Provider>,
        );

        fireEvent.change(screen.getByLabelText(/Email/i), {
            target: { value: 'wrong' },
        });
        fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

        expect(await screen.findByText(/Invalid email format/i)).toBeInTheDocument();
    });

    it('switches to register modal', () => {
        render(
            <AuthContext.Provider value={mockAuthContextValue}>
                <Login onClose={onClose} onSwitchToRegister={onSwitchToRegister} />
            </AuthContext.Provider>,
        );

        fireEvent.click(screen.getByText(/Create an account/i));
        expect(onSwitchToRegister).toHaveBeenCalled();
    });
});
