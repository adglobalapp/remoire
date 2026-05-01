import { render, screen, fireEvent } from '@testing-library/react';
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

vi.mock('../pages/Notes/components/Modal/NoteModal', () => ({
    default: () => <div data-testid="note-modal">Note Modal</div>,
}));

describe('NotesPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders correctly', async () => {
        vi.mocked(api.getNotes).mockResolvedValue([]);

        render(
            <BrowserRouter>
                <NotesPage />
            </BrowserRouter>,
        );

        expect(screen.getByTestId('navbar')).toBeInTheDocument();
        expect(await screen.findByText('Notes')).toBeInTheDocument();
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
        ];
        vi.mocked(api.getNotes).mockResolvedValue(mockNotes);

        render(
            <BrowserRouter>
                <NotesPage />
            </BrowserRouter>,
        );

        expect(await screen.findByText('Note 1')).toBeInTheDocument();
    });

    it('opens add note modal when clicking the button', async () => {
        vi.mocked(api.getNotes).mockResolvedValue([]);

        render(
            <BrowserRouter>
                <NotesPage />
            </BrowserRouter>,
        );

        const addBtn = await screen.findByRole('button', { name: /Add Note/i });
        fireEvent.click(addBtn);

        expect(screen.getByTestId('note-modal')).toBeInTheDocument();
    });
});
