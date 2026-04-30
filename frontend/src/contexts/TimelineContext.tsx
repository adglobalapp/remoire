import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as api from '../api/timelines';
import { type Timeline, type TimelineContextValue, type TimelineProviderProps, type ApiError } from '../types';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const DEFAULT_TIMELINE: Timeline = {
    id: 0,
    name: 'All Entries',
    isDefault: true,
    entryIds: [],
};

export const TimelineContext = createContext<TimelineContextValue | null>(null);

export const TimelineProvider = ({ children }: TimelineProviderProps) => {
    const { isAuthenticated } = useAuth();
    const [timelines, setTimelines] = useState<Timeline[]>([DEFAULT_TIMELINE]);
    const [activeTimeline, setActiveTimeline] = useState<Timeline | null>(DEFAULT_TIMELINE);
    const [isLoading, setIsLoading] = useState(true);

    const refreshTimelines = useCallback(
        async (newActiveId?: number) => {
            if (!isAuthenticated) return;

            try {
                const data = await api.getTimelines();
                setTimelines(data);
                setActiveTimeline((curr) => {
                    const targetId = newActiveId !== undefined ? newActiveId : curr?.id;
                    return data.find((t) => t.id === targetId) || data[0];
                });
            } catch (err: unknown) {
                const error = err as ApiError;
                if (error.status !== 401) {
                    toast.error(error.message || 'Failed to refresh timelines');
                }
            }
        },
        [isAuthenticated],
    );

    useEffect(() => {
        setIsLoading(true);
        refreshTimelines().finally(() => setIsLoading(false));
    }, [refreshTimelines]);

    const selectTimeline = useCallback((timeline: Timeline) => {
        setActiveTimeline(timeline);
    }, []);

    const createTimeline = useCallback(
        async (name: string) => {
            try {
                const newTimeline = await api.createTimeline(name);
                await refreshTimelines(newTimeline.id);
                if (newTimeline.message) toast.success(newTimeline.message);
                return newTimeline;
            } catch (err: unknown) {
                const error = err as ApiError;
                toast.error(error.message || 'Failed to create timeline');
                return null;
            }
        },
        [refreshTimelines],
    );

    const deleteTimeline = useCallback(
        async (id: number) => {
            try {
                const res = await api.deleteTimeline(id);
                await refreshTimelines();
                if (res?.message) toast.success(res.message);
                return res;
            } catch (err: unknown) {
                const error = err as ApiError;
                toast.error(error.message || 'Failed to delete timeline');
            }
        },
        [refreshTimelines],
    );

    const addEntryToTimeline = useCallback(
        async (timelineId: number, entryId: number) => {
            try {
                const res = await api.addEntryToTimeline(timelineId, entryId);
                await refreshTimelines();
                if (res?.message) toast.success(res.message);
                return res;
            } catch (err: unknown) {
                const error = err as ApiError;
                toast.error(error.message || 'Failed to add entry to timeline');
            }
        },
        [refreshTimelines],
    );

    const removeEntryFromTimeline = useCallback(
        async (timelineId: number, entryId: number) => {
            try {
                const res = await api.removeEntryFromTimeline(timelineId, entryId);
                await refreshTimelines();
                if (res?.message) toast.success(res.message);
                return res;
            } catch (err: unknown) {
                const error = err as ApiError;
                toast.error(error.message || 'Failed to remove entry from timeline');
            }
        },
        [refreshTimelines],
    );

    return (
        <TimelineContext.Provider
            value={{
                timelines,
                activeTimeline,
                selectTimeline,
                createTimeline,
                deleteTimeline,
                addEntryToTimeline,
                removeEntryFromTimeline,
                isLoading,
            }}
        >
            {children}
        </TimelineContext.Provider>
    );
};

export const useTimelineContext = () => {
    const ctx = useContext(TimelineContext);
    if (!ctx) throw new Error('useTimelineContext must be used inside TimelineProvider');
    return ctx;
};
