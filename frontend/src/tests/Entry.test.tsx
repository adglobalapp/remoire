import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EntryPage from '../pages/Entry/index';
import { EntryContext } from '../contexts/EntryContext';
import { type EntryContextValue } from '../types';

vi.mock('../components/common/Navbar', () => ({
    default: () => <div data-testid="navbar">Navbar</div>,
}));
vi.mock('../pages/Entry/components/sidebar/Left', () => ({
    default: () => <div data-testid="sidebar-left">Left</div>,
}));
vi.mock('../pages/Entry/components/sidebar/Right', () => ({
    default: () => <div data-testid="sidebar-right">Right</div>,
}));
vi.mock('../pages/Entry/components/editor/Canvas', () => ({
    default: () => <div data-testid="canvas">Canvas</div>,
}));

const mockEntryContextValue: EntryContextValue = {
    entries: [],
    activeEntry: {
        id: 1,
        user_id: 1,
        title: 'Test Entry',
        content: '{}',
        date: '2026-04-24',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    },
    isLoading: false,
    selectEntry: vi.fn(),
    createEntry: vi.fn(),
    deleteEntry: vi.fn(),
    saveEntry: vi.fn(),
    updateEntry: vi.fn(),
};

describe('EntryPage', () => {
    it('renders sidebars and canvas when not loading', () => {
        render(
            <EntryContext.Provider value={mockEntryContextValue}>
                <EntryPage />
            </EntryContext.Provider>,
        );

        expect(screen.getByTestId('navbar')).toBeInTheDocument();
        expect(screen.getByTestId('sidebar-left')).toBeInTheDocument();
        expect(screen.getByTestId('sidebar-right')).toBeInTheDocument();
        expect(screen.getByTestId('canvas')).toBeInTheDocument();
    });

    it('renders loader when loading', () => {
        const loadingValue = { ...mockEntryContextValue, isLoading: true };
        render(
            <EntryContext.Provider value={loadingValue}>
                <EntryPage />
            </EntryContext.Provider>,
        );

        expect(screen.queryByTestId('canvas')).not.toBeInTheDocument();
    });
});
