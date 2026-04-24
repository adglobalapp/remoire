import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AddFriend from '../pages/Friendlist/components/modal/AddFriend';
import * as api from '../api';
import { UserProfileContext } from '../contexts/UserProfileContext';
import { type User, type UserProfileContextType } from '../types';

vi.mock('../api', () => ({
    searchUsers: vi.fn(),
    sendRelationshipRequest: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
    default: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

const mockContextValue: UserProfileContextType = {
    showProfile: vi.fn(),
    blockedUserIds: new Set(),
    isBlocked: vi.fn().mockReturnValue(false),
    refreshBlockedUsers: vi.fn(),
    blockUser: vi.fn(),
    unblockUser: vi.fn(),
};

describe('AddFriend Component', () => {
    const onClose = vi.fn();
    const onRefresh = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders correctly', () => {
        render(
            <UserProfileContext.Provider value={mockContextValue}>
                <AddFriend onClose={onClose} onRefresh={onRefresh} />
            </UserProfileContext.Provider>,
        );

        expect(screen.getByPlaceholderText(/Search by name or friend code/i)).toBeInTheDocument();
        expect(screen.getByText(/Find Friends/i)).toBeInTheDocument();
    });

    it('searches for users when typing', async () => {
        const mockUsers: User[] = [
            {
                id: 1,
                name: 'John Doe',
                email: 'john@example.com',
                friend_code: 'JD123',
                relationship_status: 'none',
                created_at: new Date().toISOString(),
            },
        ];
        vi.mocked(api.searchUsers).mockResolvedValue(mockUsers);

        render(
            <UserProfileContext.Provider value={mockContextValue}>
                <AddFriend onClose={onClose} onRefresh={onRefresh} />
            </UserProfileContext.Provider>,
        );

        const input = screen.getByPlaceholderText(/Search by name or friend code/i);
        fireEvent.change(input, { target: { value: 'John' } });

        await waitFor(() => {
            expect(api.searchUsers).toHaveBeenCalledWith('John');
        });

        expect(await screen.findByText('John Doe')).toBeInTheDocument();
    });

    it('calls sendRelationshipRequest when clicking Add', async () => {
        const mockUsers: User[] = [
            {
                id: 1,
                name: 'John Doe',
                email: 'john@example.com',
                friend_code: 'JD123',
                relationship_status: 'none',
                created_at: new Date().toISOString(),
            },
        ];
        vi.mocked(api.searchUsers).mockResolvedValue(mockUsers);
        vi.mocked(api.sendRelationshipRequest).mockResolvedValue({ message: 'Request sent' } as any);

        render(
            <UserProfileContext.Provider value={mockContextValue}>
                <AddFriend onClose={onClose} onRefresh={onRefresh} />
            </UserProfileContext.Provider>,
        );

        fireEvent.change(screen.getByPlaceholderText(/Search by name or friend code/i), {
            target: { value: 'John' },
        });

        const addButton = await screen.findByRole('button', { name: /Add/i });
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(api.sendRelationshipRequest).toHaveBeenCalledWith(1);
        });
    });
});
