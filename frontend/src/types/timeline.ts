import { type ReactNode } from 'react';
import { type Timeline } from './models';

export interface TimelineContextValue {
    timelines: Timeline[];
    activeTimeline: Timeline | null;
    selectTimeline: (timeline: Timeline) => void;
    createTimeline: (name: string) => Promise<void>;
    deleteTimeline: (id: number) => Promise<void>;
    addEntryToTimeline: (timelineId: number, entryId: number) => Promise<void>;
    removeEntryFromTimeline: (timelineId: number, entryId: number) => Promise<void>;
    isLoading: boolean;
}

export interface TimelineProviderProps {
    children: ReactNode;
}
