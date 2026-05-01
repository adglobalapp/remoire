import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TimelinePage from '../pages/Timeline/index';
import { TimelineContext } from '../contexts/TimelineContext';
import { type TimelineContextValue } from '../types';

vi.mock('../components/common/Navbar', () => ({
    default: () => <div data-testid="navbar">Navbar</div>,
}));
vi.mock('../pages/Timeline/components/sidebar/Left', () => ({
    default: () => <div data-testid="sidebar">Sidebar</div>,
}));
vi.mock('../pages/Timeline/components/canvas/Canvas', () => ({
    default: () => <div data-testid="canvas">Canvas</div>,
}));

const mockTimelineContextValue: TimelineContextValue = {
    timelines: [],
    activeTimeline: { id: 1, name: 'Default', isDefault: true, entryIds: [] },
    isLoading: false,
    selectTimeline: vi.fn(),
    createTimeline: vi.fn(),
    deleteTimeline: vi.fn(),
    addEntryToTimeline: vi.fn(),
    removeEntryFromTimeline: vi.fn(),
};

vi.mock('../contexts/AuthContext', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../contexts/AuthContext')>();
    return {
        ...actual,
        useAuth: () => ({
            isAuthenticated: true,
            user: { id: 1, name: 'Test' },
            isLoading: false,
        }),
    };
});

describe('TimelinePage', () => {
    it('renders correctly', () => {
        render(
            <TimelineContext.Provider value={mockTimelineContextValue}>
                <TimelinePage />
            </TimelineContext.Provider>,
        );

        expect(screen.getByTestId('navbar')).toBeInTheDocument();
        expect(screen.getByTestId('sidebar')).toBeInTheDocument();
        expect(screen.getByTestId('canvas')).toBeInTheDocument();
    });

    it('renders loading state', () => {
        const loadingValue = {
            ...mockTimelineContextValue,
            isLoading: true,
            activeTimeline: null,
        };
        render(
            <TimelineContext.Provider value={loadingValue}>
                <TimelinePage />
            </TimelineContext.Provider>,
        );

        expect(screen.queryByTestId('canvas')).not.toBeInTheDocument();
    });
});
