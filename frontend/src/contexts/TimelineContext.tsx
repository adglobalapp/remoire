import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as api from '../services/api';
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
    const [isLoading, setIsLoading] = useState(true);

    // Initial fetch
    useEffect(() => {
        const fetchTimelines = async () => {
            setIsLoading(true);
            try {
                const data = await api.getTimelines();
                if (data.length > 0) {
                    const sorted = [...data].sort((a, b) => (a.isDefault ? 1 : b.isDefault ? -1 : 0));
                    setTimelines(sorted);
                    // Set active to first one (most recently added or first custom)
                    setActiveTimeline(sorted[0]);
                } else {
                    setTimelines([DEFAULT_TIMELINE]);
                    setActiveTimeline(DEFAULT_TIMELINE);
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchTimelines();
    }, []);

    const selectTimeline = useCallback((timeline: Timeline) => {
        setActiveTimeline(timeline);
    }, []);

    const createTimeline = useCallback(async (name: string) => {
        try {
            const newTimeline = await api.createTimeline(name);
            if (newTimeline) {
                setTimelines(prev => {
                    const next = [newTimeline, ...prev.filter(t => !t.isDefault), ...prev.filter(t => t.isDefault)];
                    return next;
                });
                setActiveTimeline(newTimeline);
            }
        } catch (error) {
            throw error;
        }
    }, []);

    const deleteTimeline = useCallback(async (id: number) => {
        const timeline = timelines.find(t => t.id === id);
        if (timeline?.isDefault) return;

        try {
            const success = await api.deleteTimeline(id);
            if (success) {
                setTimelines(prev => {
                    const next = prev.filter(t => t.id !== id);
                    setActiveTimeline(curr => {
                        if (curr?.id === id) return next[0] || DEFAULT_TIMELINE;
                        return curr;
                    });
                    return next;
                });
            }
        } catch (error) {
            throw error;
        }
    }, [timelines]);

    const addEntryToTimeline = useCallback(async (timelineId: number, entryId: number) => {
        const timeline = timelines.find(t => t.id === timelineId);
        if (timeline?.isDefault) return;

        try {
            const success = await api.addEntryToTimeline(timelineId, entryId);
            if (success) {
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
            }
        } catch (error) {
            throw error;
        }
    }, [timelines]);

    const removeEntryFromTimeline = useCallback(async (timelineId: number, entryId: number) => {
        const timeline = timelines.find(t => t.id === timelineId);
        if (timeline?.isDefault) return;

        try {
            const success = await api.removeEntryFromTimeline(timelineId, entryId);
            if (success) {
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
            }
        } catch (error) {
            throw error;
        }
    }, [timelines]);

    return (
        <TimelineContext.Provider value={{
            timelines,
            activeTimeline,
            selectTimeline,
            createTimeline,
            deleteTimeline,
            addEntryToTimeline,
            removeEntryFromTimeline,
            isLoading,
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
