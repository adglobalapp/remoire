import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NotesPage from '../pages/Notes/index';
import * as api from '../api';
import { BrowserRouter } from 'react-router-dom';
import { type Note } from '../types';

vi.mock('../api', () => ({
    getNotes: vi.fn(),
    createNote: vi.fn(),
    updateNote: vi.fn(),
    deleteNote: vi.fn(),
}));

vi.mock('../components/common/Navbar', () => ({
    default: () => <div data-testid="navbar">Navbar</div>,
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

describe('NotesPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders loading state initially', async () => {
        vi.mocked(api.getNotes).mockReturnValue(new Promise(() => {}));

        render(
            <BrowserRouter>
                <NotesPage />
            </BrowserRouter>,
        );

        expect(screen.getByTestId('navbar')).toBeInTheDocument();
    });

    it('renders notes after loading', async () => {
        const mockNotes: Note[] = [
            {
                id: 1,
                user_id: 1,
                title: 'Note 1',
                content: 'Content 1',
                is_pinned: false,
                color: '#fff',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
            {
                id: 2,
                user_id: 1,
                title: 'Note 2',
                content: 'Content 2',
                is_pinned: true,
                color: '#fff',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
        ];
        vi.mocked(api.getNotes).mockResolvedValue(mockNotes);

        render(
            <BrowserRouter>
                <NotesPage />
            </BrowserRouter>,
        );

        expect(await screen.findByText('Note 1')).toBeInTheDocument();
        expect(await screen.findByText('Note 2')).toBeInTheDocument();
        expect(screen.getByText('Notes')).toBeInTheDocument();
    });

    it('renders empty state when no notes found', async () => {
        vi.mocked(api.getNotes).mockResolvedValue([]);

        render(
            <BrowserRouter>
                <NotesPage />
            </BrowserRouter>,
        );

        expect(await screen.findByText(/No notes yet/i)).toBeInTheDocument();
    });
});
