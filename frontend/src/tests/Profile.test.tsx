import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Profile from '../pages/Profile/index';
import { UserProfileContext } from '../contexts/UserProfileContext';
import { BrowserRouter } from 'react-router-dom';
import * as profileApi from '../api/profile';
import { type User, type UserProfileContextType } from '../types';

vi.mock('../api/profile', () => ({
    updateProfile: vi.fn(),
    updatePassword: vi.fn(),
    getBlockedUsers: vi.fn().mockResolvedValue([]),
}));

vi.mock('../components/common/Navbar', () => ({
    default: () => <div data-testid="navbar">Navbar</div>,
}));

const mockAuthResult = {
    isAuthenticated: true,
    user: {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        friend_code: 'JD123',
        bio: 'Hello world',
    },
    isLoading: false,
    setUser: vi.fn(),
};

vi.mock('../contexts/AuthContext', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../contexts/AuthContext')>();
    return {
        ...actual,
        useAuth: () => mockAuthResult,
    };
});

const mockUser: User = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    friend_code: 'JD123',
    bio: 'Hello world',
    created_at: '',
};

const mockUserProfileContextValue: UserProfileContextType = {
    showProfile: vi.fn(),
    blockedUserIds: new Set(),
    blockedUsers: [],
    isLoadingBlocked: false,
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
            <BrowserRouter>
                <UserProfileContext.Provider value={mockUserProfileContextValue}>
                    <Profile />
                </UserProfileContext.Provider>
            </BrowserRouter>,
        );

        expect(await screen.findByText('John Doe')).toBeInTheDocument();
        expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
        expect(screen.getByLabelText(/Current Password/i)).toBeInTheDocument();
    });

    it('calls updateProfile when saving details', async () => {
        vi.mocked(profileApi.updateProfile).mockResolvedValue({
            user: { ...mockUser, name: 'New Name' },
        });

        render(
            <BrowserRouter>
                <UserProfileContext.Provider value={mockUserProfileContextValue}>
                    <Profile />
                </UserProfileContext.Provider>
            </BrowserRouter>,
        );

        await screen.findByText('John Doe');
        await screen.findByText(/No blocked users/i);

        fireEvent.change(screen.getByDisplayValue('John Doe'), {
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
            <BrowserRouter>
                <UserProfileContext.Provider value={mockUserProfileContextValue}>
                    <Profile />
                </UserProfileContext.Provider>
            </BrowserRouter>,
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
