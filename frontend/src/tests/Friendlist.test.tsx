import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FriendlistPage from '../pages/Friendlist/index';
import AddFriend from '../pages/Friendlist/components/modal/AddFriend';
import * as api from '../api';
import { UserProfileContext } from '../contexts/UserProfileContext';
import { type UserProfileContextType, type User } from '../types';

vi.mock('../api', () => ({
    getRelationships: vi.fn(),
    getRelationshipRequests: vi.fn(),
    acceptRelationshipRequest: vi.fn(),
    deleteRelationship: vi.fn(),
    searchUsers: vi.fn(),
    sendRelationshipRequest: vi.fn(),
}));

vi.mock('../components/common/Navbar', () => ({
    default: () => <div data-testid="navbar">Navbar</div>,
}));

vi.mock('../pages/Friendlist/components/list/List', () => ({
    default: ({ title }: { title: string }) => <div data-testid="list">{title}</div>,
}));

vi.mock('react-hot-toast', () => ({
    default: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

const mockUserProfileContextValue: UserProfileContextType = {
    showProfile: vi.fn(),
    blockedUserIds: new Set(),
    isBlocked: vi.fn().mockReturnValue(false),
    refreshBlockedUsers: vi.fn(),
    blockUser: vi.fn(),
    unblockUser: vi.fn(),
};

describe('FriendlistPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders loading state initially', () => {
        vi.mocked(api.getRelationships).mockReturnValue(new Promise(() => {}));
        vi.mocked(api.getRelationshipRequests).mockReturnValue(new Promise(() => {}));

        render(
            <UserProfileContext.Provider value={mockUserProfileContextValue}>
                <FriendlistPage />
            </UserProfileContext.Provider>,
        );

        expect(screen.getByTestId('navbar')).toBeInTheDocument();
    });

    it('renders lists after loading data', async () => {
        vi.mocked(api.getRelationships).mockResolvedValue([]);
        vi.mocked(api.getRelationshipRequests).mockResolvedValue({
            pending: [],
            sent: [],
        });

        render(
            <UserProfileContext.Provider value={mockUserProfileContextValue}>
                <FriendlistPage />
            </UserProfileContext.Provider>,
        );

        expect(await screen.findByText('Friends')).toBeInTheDocument();
        expect(screen.getByText('Pending Requests')).toBeInTheDocument();
        expect(screen.getByText('Sent Requests')).toBeInTheDocument();
        expect(screen.getByText('My Friends')).toBeInTheDocument();
    });
});

describe('AddFriend Modal (Tested within Friendlist context)', () => {
    const onClose = vi.fn();
    const onRefresh = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
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
            <UserProfileContext.Provider value={mockUserProfileContextValue}>
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
        vi.mocked(api.sendRelationshipRequest).mockResolvedValue({ message: 'Request sent' });

        render(
            <UserProfileContext.Provider value={mockUserProfileContextValue}>
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
