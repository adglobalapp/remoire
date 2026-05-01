import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MailboxPage from '../pages/Mailbox/index';
import * as notifApi from '../api/notifications';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { type Notification, type AuthContextType } from '../types';

vi.mock('../api/notifications', () => ({
    getNotifications: vi.fn(),
    markAsRead: vi.fn(),
    deleteNotification: vi.fn(),
}));

const mockNotifications: Notification[] = [
    {
        id: 1,
        user_id: 1,
        type: 'friend_request',
        data: { requester_name: 'Alice' },
        read_at: null,
        created_at: new Date().toISOString(),
    },
    {
        id: 2,
        user_id: 1,
        type: 'anniversary',
        data: { entry_title: 'Summer Trip', years: 2 },
        read_at: '2026-04-24T12:00:00Z',
        created_at: new Date().toISOString(),
    },
];

const mockAuthContextValue: Partial<AuthContextType> = {
    isAuthenticated: true,
    user: { id: 1, name: 'Test User', email: 'test@test.com', friend_code: 'T123', created_at: '' },
};

describe('MailboxPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders notifications correctly', async () => {
        vi.mocked(notifApi.getNotifications).mockResolvedValue(mockNotifications);

        render(
            <BrowserRouter>
                <AuthContext.Provider value={mockAuthContextValue as AuthContextType}>
                    <MailboxPage />
                </AuthContext.Provider>
            </BrowserRouter>,
        );

        expect(await screen.findByText(/New friend request from Alice/i)).toBeInTheDocument();
        expect(screen.getByText(/Memory anniversary: "Summer Trip" happened 2 years ago!/i)).toBeInTheDocument();
    });

    it('handles marking a notification as read', async () => {
        vi.mocked(notifApi.getNotifications).mockResolvedValue(mockNotifications);
        vi.mocked(notifApi.markAsRead).mockResolvedValue({ message: 'Marked as read' });

        render(
            <BrowserRouter>
                <AuthContext.Provider value={mockAuthContextValue as AuthContextType}>
                    <MailboxPage />
                </AuthContext.Provider>
            </BrowserRouter>,
        );

        const readButton = await screen.findAllByTitle(/Mark as read/i);
        fireEvent.click(readButton[0]);

        await waitFor(() => {
            expect(notifApi.markAsRead).toHaveBeenCalledWith(1);
        });
    });

    it('handles deleting a notification', async () => {
        vi.mocked(notifApi.getNotifications).mockResolvedValue(mockNotifications);
        vi.mocked(notifApi.deleteNotification).mockResolvedValue({ message: 'Deleted' });

        render(
            <BrowserRouter>
                <AuthContext.Provider value={mockAuthContextValue as AuthContextType}>
                    <MailboxPage />
                </AuthContext.Provider>
            </BrowserRouter>,
        );

        const deleteButtons = await screen.findAllByTitle(/Delete notification/i);
        fireEvent.click(deleteButtons[0]);

        expect(screen.getByText(/Are you sure you want to delete this notification/i)).toBeInTheDocument();

        const confirmButton = screen.getByRole('button', { name: /^Delete$/ });
        fireEvent.click(confirmButton);

        await waitFor(() => {
            expect(notifApi.deleteNotification).toHaveBeenCalledWith(1);
        });
    });

    it('shows empty state when no notifications', async () => {
        vi.mocked(notifApi.getNotifications).mockResolvedValue([]);

        render(
            <BrowserRouter>
                <AuthContext.Provider value={mockAuthContextValue as AuthContextType}>
                    <MailboxPage />
                </AuthContext.Provider>
            </BrowserRouter>,
        );

        expect(await screen.findByText(/Your mailbox is empty/i)).toBeInTheDocument();
    });
});
