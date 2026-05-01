import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TimelinePage from '../pages/Timeline/index';
import { TimelineContext } from '../contexts/TimelineContext';
import { type TimelineContextValue, type Timeline } from '../types';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../api', () => ({
    getRelationships: vi.fn().mockResolvedValue([]),
    getTimelines: vi.fn().mockResolvedValue([]),
}));

vi.mock('../components/common/Navbar', () => ({
    default: () => <div data-testid="navbar">Navbar</div>,
}));

vi.mock('../pages/Timeline/components/sidebar/Left', () => ({
    default: () => <div data-testid="sidebar">Sidebar</div>,
}));
vi.mock('../pages/Timeline/components/canvas/Canvas', () => ({
    default: () => (
        <div data-testid="canvas">
            Canvas
            <button>Add Entry</button>
        </div>
    ),
}));

const mockTimelineContextValue: TimelineContextValue = {
    timelines: [],
    activeTimeline: null,
    isLoading: false,
    selectTimeline: vi.fn(),
    createTimeline: vi.fn(),
    deleteTimeline: vi.fn(),
    addEntryToTimeline: vi.fn(),
    removeEntryFromTimeline: vi.fn(),
};

describe('TimelinePage', () => {
    it('renders correctly', () => {
        render(
            <BrowserRouter>
                <TimelineContext.Provider value={mockTimelineContextValue}>
                    <TimelinePage />
                </TimelineContext.Provider>
            </BrowserRouter>,
        );

        expect(screen.getByTestId('navbar')).toBeInTheDocument();
        expect(screen.getByTestId('sidebar')).toBeInTheDocument();
        expect(screen.getByTestId('canvas')).toBeInTheDocument();
    });

    it('shows add entry button when timeline is provided', () => {
        const activeTimeline: Timeline = { id: 2, name: 'Travel', isDefault: false, entryIds: [] };
        render(
            <BrowserRouter>
                <TimelineContext.Provider value={{ ...mockTimelineContextValue, activeTimeline }}>
                    <TimelinePage />
                </TimelineContext.Provider>
            </BrowserRouter>,
        );

        expect(screen.getByText(/Add Entry/i)).toBeInTheDocument();
    });
});
