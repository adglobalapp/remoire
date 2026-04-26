import { type ReactNode } from 'react';
import { type Timeline } from './models';

export interface TimelineContextValue {
    timelines: Timeline[];
    activeTimeline: Timeline | null;
    selectTimeline: (timeline: Timeline) => void;
    createTimeline: (name: string) => Promise<Timeline | null>;
    deleteTimeline: (id: number) => Promise<{ message?: string }>;
    addEntryToTimeline: (timelineId: number, entryId: number) => Promise<{ message?: string }>;
    removeEntryFromTimeline: (timelineId: number, entryId: number) => Promise<{ message?: string }>;
    isLoading: boolean;
}

export interface TimelineProviderProps {
    children: ReactNode;
}
