import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EntryPage from '../pages/Entry/index';
import { EntryContext } from '../contexts/EntryContext';
import { type EntryContextValue } from '../types';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../api', () => ({
    getRelationships: vi.fn().mockResolvedValue([]),
    getEntries: vi.fn().mockResolvedValue([]),
    updateEntry: vi.fn().mockResolvedValue({}),
    createEntry: vi.fn().mockResolvedValue({}),
    deleteEntry: vi.fn().mockResolvedValue({}),
}));

vi.mock('../components/common/Navbar', () => ({
    default: () => <div data-testid="navbar">Navbar</div>,
}));

vi.mock('../contexts/AuthContext', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../contexts/AuthContext')>();
    return {
        ...actual,
        useAuth: () => ({ isAuthenticated: true, user: { id: 1 } }),
    };
});

vi.mock('../contexts/UserProfileContext', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../contexts/UserProfileContext')>();
    return {
        ...actual,
        useUserProfile: () => ({ blockedUserIds: new Set() }),
    };
});

vi.mock('../pages/Entry/components/sidebar/left/Left', () => ({
    default: () => (
        <div data-testid="sidebar-left">
            Left
            <button>Add Entry</button>
        </div>
    ),
}));
vi.mock('../pages/Entry/components/sidebar/right/Right', () => ({
    default: () => <div data-testid="sidebar-right">Right</div>,
}));
vi.mock('../pages/Entry/components/editor/Canvas', () => ({
    default: () => <div data-testid="canvas">Canvas</div>,
}));

const mockEntryContextValue: EntryContextValue = {
    entries: [],
    activeEntry: null,
    isLoading: false,
    selectEntry: vi.fn(),
    createEntry: vi.fn(),
    deleteEntry: vi.fn(),
    dispatchSave: vi.fn(),
    updateEntry: vi.fn(),
};

describe('EntryPage', () => {
    it('renders basic layout', async () => {
        render(
            <BrowserRouter>
                <EntryContext.Provider value={mockEntryContextValue}>
                    <EntryPage />
                </EntryContext.Provider>
            </BrowserRouter>,
        );

        expect(screen.getByTestId('navbar')).toBeInTheDocument();
        expect(screen.getByTestId('sidebar-left')).toBeInTheDocument();
        expect(screen.getByTestId('sidebar-right')).toBeInTheDocument();
        expect(screen.getByTestId('canvas')).toBeInTheDocument();
        expect(screen.getByText(/Add Entry/i)).toBeInTheDocument();
    });
});
