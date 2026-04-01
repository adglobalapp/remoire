import { createContext, useContext, useState, useCallback } from 'react';
import { type Timeline, type TimelineContextValue, type TimelineProviderProps } from '../types';

const DEFAULT_TIMELINE: Timeline = {
    id: 0,
    name: 'All Entries',
    isDefault: true,
    entryIds: [],
};

export const TimelineContext = createContext<TimelineContextValue | null>(null);

export const TimelineProvider = ({ children }: TimelineProviderProps) => {

    const [timelines, setTimelines] = useState<Timeline[]>([DEFAULT_TIMELINE]);
    const [activeTimeline, setActiveTimeline] = useState<Timeline | null>(DEFAULT_TIMELINE);

    const selectTimeline = useCallback((timeline: Timeline) => {
        setActiveTimeline(timeline);
    }, []);

    const createTimeline = useCallback((name: string) => {
        const newTimeline: Timeline = {
            id: Date.now(),
            name,
            isDefault: false,
            entryIds: [],
        };
        setTimelines(prev => [...prev, newTimeline]);
        setActiveTimeline(newTimeline);
    }, []);

    const deleteTimeline = useCallback((id: number) => {
        setTimelines(prev => {
            const next = prev.filter(t => t.id !== id);
            setActiveTimeline(curr => {
                if (curr?.id === id) return next[0] ?? null;
                return curr;
            });
            return next;
        });
    }, []);

    const addEntryToTimeline = useCallback((timelineId: number, entryId: number) => {
        setTimelines(prev => prev.map(t =>
            t.id === timelineId && !t.entryIds.includes(entryId)
                ? { ...t, entryIds: [...t.entryIds, entryId] }
                : t
        ));
        setActiveTimeline(curr =>
            curr?.id === timelineId && !curr.entryIds.includes(entryId)
                ? { ...curr, entryIds: [...curr.entryIds, entryId] }
                : curr
        );
    }, []);

    const removeEntryFromTimeline = useCallback((timelineId: number, entryId: number) => {
        setTimelines(prev => prev.map(t =>
            t.id === timelineId
                ? { ...t, entryIds: t.entryIds.filter(id => id !== entryId) }
                : t
        ));
        setActiveTimeline(curr =>
            curr?.id === timelineId
                ? { ...curr, entryIds: curr.entryIds.filter(id => id !== entryId) }
                : curr
        );
    }, []);

    return (
        <TimelineContext.Provider value={{
            timelines,
            activeTimeline,
            selectTimeline,
            createTimeline,
            deleteTimeline,
            addEntryToTimeline,
            removeEntryFromTimeline,
        }}>
            {children}
        </TimelineContext.Provider>
    );
};

export const useTimelineContext = () => {
    const ctx = useContext(TimelineContext);
    if (!ctx) throw new Error('useTimelineContext must be used inside TimelineProvider');
    return ctx;
};
