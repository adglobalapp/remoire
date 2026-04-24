import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Profile from '../pages/Profile/index';
import { AuthContext } from '../contexts/AuthContext';
import { UserProfileContext } from '../contexts/UserProfileContext';
import * as profileApi from '../api/profile';
import { type User, type AuthContextType, type UserProfileContextType } from '../types';

vi.mock('../api/profile', () => ({
    updateProfile: vi.fn(),
    updatePassword: vi.fn(),
    getBlockedUsers: vi.fn().mockResolvedValue([]),
}));

const mockUser: User = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    friend_code: 'JD123',
    bio: 'Hello world',
    created_at: '',
};

const mockAuthContextValue: Partial<AuthContextType> = {
    user: mockUser,
    setUser: vi.fn(),
    isAuthenticated: true,
    isLoading: false,
};

const mockUserProfileContextValue: UserProfileContextType = {
    showProfile: vi.fn(),
    blockedUserIds: new Set(),
    isBlocked: vi.fn().mockReturnValue(false),
    unblockUser: vi.fn(),
    refreshBlockedUsers: vi.fn(),
    blockUser: vi.fn(),
};

describe('Profile Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders user details correctly', async () => {
        render(
            <AuthContext.Provider value={mockAuthContextValue as any}>
                <UserProfileContext.Provider value={mockUserProfileContextValue}>
                    <Profile />
                </UserProfileContext.Provider>
            </AuthContext.Provider>,
        );

        expect(await screen.findByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('john@example.com')).toBeInTheDocument();
        expect(screen.getByText('JD123')).toBeInTheDocument();
        expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Hello world')).toBeInTheDocument();
        expect(await screen.findByText(/No blocked users/i)).toBeInTheDocument();
    });

    it('calls updateProfile when saving details', async () => {
        vi.mocked(profileApi.updateProfile).mockResolvedValue({
            user: { ...mockUser, name: 'New Name' },
        });

        render(
            <AuthContext.Provider value={mockAuthContextValue as any}>
                <UserProfileContext.Provider value={mockUserProfileContextValue}>
                    <Profile />
                </UserProfileContext.Provider>
            </AuthContext.Provider>,
        );

        await screen.findByText('John Doe');
        await screen.findByText(/No blocked users/i);

        fireEvent.change(screen.getByLabelText(/What should we call you/i), {
            target: { value: 'New Name' },
        });
        fireEvent.click(screen.getByRole('button', { name: /Save/i }));

        await waitFor(() => {
            expect(profileApi.updateProfile).toHaveBeenCalledWith({
                name: 'New Name',
                bio: 'Hello world',
            });
        });
    });

    it('handles password updates', async () => {
        vi.mocked(profileApi.updatePassword).mockResolvedValue(true);

        render(
            <AuthContext.Provider value={mockAuthContextValue as any}>
                <UserProfileContext.Provider value={mockUserProfileContextValue}>
                    <Profile />
                </UserProfileContext.Provider>
            </AuthContext.Provider>,
        );

        await screen.findByText('John Doe');
        await screen.findByText(/No blocked users/i);

        fireEvent.change(screen.getByLabelText(/Current Password/i), {
            target: { value: 'oldpass' },
        });
        fireEvent.change(screen.getByLabelText(/^New Password/i), {
            target: { value: 'newpass' },
        });
        fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
            target: { value: 'newpass' },
        });

        fireEvent.click(screen.getByRole('button', { name: /Update/i }));

        await waitFor(() => {
            expect(profileApi.updatePassword).toHaveBeenCalled();
        });
    });
});
