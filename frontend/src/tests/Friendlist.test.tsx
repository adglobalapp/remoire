import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FriendlistPage from '../pages/Friendlist/index';
import * as api from '../api';
import { UserProfileContext } from '../contexts/UserProfileContext';
import { type UserProfileContextType } from '../types';

vi.mock('../api', () => ({
    getRelationships: vi.fn(),
    getRelationshipRequests: vi.fn(),
    acceptRelationshipRequest: vi.fn(),
    deleteRelationship: vi.fn(),
}));

vi.mock('../components/common/Navbar', () => ({
    default: () => <div data-testid="navbar">Navbar</div>,
}));
vi.mock('../pages/Friendlist/components/list/List', () => ({
    default: ({ title }: { title: string }) => <div data-testid="list">{title}</div>,
}));

const mockUserProfileContextValue: UserProfileContextType = {
    showProfile: vi.fn(),
    blockedUserIds: new Set(),
    isBlocked: vi.fn().mockReturnValue(false),
    blockUser: vi.fn(),
    unblockUser: vi.fn(),
    refreshBlockedUsers: vi.fn(),
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
        const lists = await screen.findAllByTestId('list');
        expect(lists).toHaveLength(3);
        expect(screen.getByText('Pending Requests')).toBeInTheDocument();
        expect(screen.getByText('Sent Requests')).toBeInTheDocument();
        expect(screen.getByText('My Friends')).toBeInTheDocument();
    });
});
