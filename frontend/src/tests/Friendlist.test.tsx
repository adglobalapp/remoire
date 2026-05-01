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

vi.mock('../contexts/AuthContext', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../contexts/AuthContext')>();
    return {
        ...actual,
        useAuth: () => ({
            isAuthenticated: true,
            user: { id: 1, name: 'Test User' },
        }),
    };
});

vi.mock('../components/common/Navbar', () => ({
    default: () => <div data-testid="navbar">Navbar</div>,
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
    blockedUsers: [],
    isLoadingBlocked: false,
    isBlocked: vi.fn().mockReturnValue(false),
    refreshBlockedUsers: vi.fn(),
    blockUser: vi.fn(),
    unblockUser: vi.fn(),
};

const mockFriends: User[] = [
    {
        id: 2,
        name: 'Friend One',
        email: 'friend1@test.com',
        friend_code: 'F1',
        relationship_status: 'accepted',
        created_at: '',
    },
];

const mockRequests: { pending: User[]; sent: User[] } = {
    pending: [
        {
            id: 3,
            name: 'Pending User',
            email: 'pending@test.com',
            friend_code: 'P1',
            relationship_status: 'pending',
            created_at: '',
        },
    ],
    sent: [],
};

describe('FriendlistPage', () => {
    it('renders friend list and requests', async () => {
        vi.mocked(api.getRelationships).mockResolvedValue(mockFriends);
        vi.mocked(api.getRelationshipRequests).mockResolvedValue(mockRequests);

        render(
            <UserProfileContext.Provider value={mockUserProfileContextValue}>
                <FriendlistPage />
            </UserProfileContext.Provider>,
        );

        expect(await screen.findByText('Friend One')).toBeInTheDocument();
        expect(screen.getByText('Pending User')).toBeInTheDocument();
    });

    it('calls acceptRelationshipRequest when clicking accept', async () => {
        vi.mocked(api.getRelationships).mockResolvedValue([]);
        vi.mocked(api.getRelationshipRequests).mockResolvedValue(mockRequests);
        vi.mocked(api.acceptRelationshipRequest).mockResolvedValue({ message: 'Accepted' });

        render(
            <UserProfileContext.Provider value={mockUserProfileContextValue}>
                <FriendlistPage />
            </UserProfileContext.Provider>,
        );

        const acceptBtn = await screen.findByTitle(/Accept request/i);
        fireEvent.click(acceptBtn);

        expect(api.acceptRelationshipRequest).toHaveBeenCalledWith(3);
    });

    it('opens add friend modal when clicking add button', async () => {
        vi.mocked(api.getRelationships).mockResolvedValue([]);
        vi.mocked(api.getRelationshipRequests).mockResolvedValue({ pending: [], sent: [] });

        render(
            <UserProfileContext.Provider value={mockUserProfileContextValue}>
                <FriendlistPage />
            </UserProfileContext.Provider>,
        );

        const addBtn = await screen.findByRole('button', { name: /Add Friend/i });
        fireEvent.click(addBtn);

        expect(screen.getByPlaceholderText(/Search by name or friend code/i)).toBeInTheDocument();
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
