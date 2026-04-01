import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
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
                    setTimelines(data);
                    // Set active to first one or default
                    setActiveTimeline(data.find(t => t.isDefault) || data[0]);
                } else {
                    // If no timelines in DB, maybe create the default one?
                    // For now just keep the local one
                    setTimelines([DEFAULT_TIMELINE]);
                }
            } catch (error) {
                toast.error('Failed to load timelines.');
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
                setTimelines(prev => [...prev, newTimeline]);
                setActiveTimeline(newTimeline);
                toast.success('Timeline created!');
            }
        } catch (error) {
            toast.error('Failed to create timeline.');
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
                        if (curr?.id === id) return next.find(t => t.isDefault) || next[0] || DEFAULT_TIMELINE;
                        return curr;
                    });
                    return next;
                });
                toast.success('Timeline deleted.');
            }
        } catch (error) {
            toast.error('Failed to delete timeline.');
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
                toast.success('Entry added to timeline.');
            }
        } catch (error) {
            toast.error('Failed to add entry.');
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
                toast.success('Entry removed.');
            }
        } catch (error) {
            toast.error('Failed to remove entry.');
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
