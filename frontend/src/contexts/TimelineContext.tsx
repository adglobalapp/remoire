import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as api from '../api/timelines';
import { type Timeline, type TimelineContextValue, type TimelineProviderProps } from '../types';
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
    const [timelines, setTimelines] = useState<Timeline[]>([DEFAULT_TIMELINE]);
    const [activeTimeline, setActiveTimeline] = useState<Timeline | null>(DEFAULT_TIMELINE);
    const [isLoading, setIsLoading] = useState(true);

    const { token } = useAuth();

    useEffect(() => {
        if (!token) {
            setTimelines([DEFAULT_TIMELINE]);
            setActiveTimeline(DEFAULT_TIMELINE);
            setIsLoading(false);
            return;
        }

        const fetchTimelines = async () => {
            setIsLoading(true);
            try {
                const data = await api.getTimelines();
                if (data && data.length > 0) {
                    const sorted = [...data].sort((a, b) => (a.isDefault ? 1 : b.isDefault ? -1 : 0));
                    setTimelines(sorted);
                    setActiveTimeline(sorted[0]);
                } else {
                    setTimelines([DEFAULT_TIMELINE]);
                    setActiveTimeline(DEFAULT_TIMELINE);
                }
            } catch (error) {
                toast.error('Failed to load timelines');
                setTimelines([DEFAULT_TIMELINE]);
                setActiveTimeline(DEFAULT_TIMELINE);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTimelines();
    }, [token]);

    const selectTimeline = useCallback((timeline: Timeline) => {
        setActiveTimeline(timeline);
    }, []);

    const createTimeline = useCallback(async (name: string) => {
        try {
            const newTimeline = await api.createTimeline(name);
            if (newTimeline) {
                setTimelines((prev) => {
                    const next = [newTimeline, ...prev.filter((t) => !t.isDefault), ...prev.filter((t) => t.isDefault)];
                    return next;
                });
                setActiveTimeline(newTimeline);
            }
        } catch (error) {
            throw error;
        }
    }, []);

    const deleteTimeline = useCallback(
        async (id: number) => {
            const timeline = timelines.find((t) => t.id === id);
            if (timeline?.isDefault) return;

            try {
                const success = await api.deleteTimeline(id);
                if (success) {
                    setTimelines((prev) => {
                        const next = prev.filter((t) => t.id !== id);
                        setActiveTimeline((curr) => {
                            if (curr?.id === id) return next[0] || DEFAULT_TIMELINE;
                            return curr;
                        });
                        return next;
                    });
                }
            } catch (error) {
                throw error;
            }
        },
        [timelines],
    );

    const updateTimelineState = useCallback((id: number, entryIds: number[]) => {
        const update = (t: Timeline) => (t.id === id ? { ...t, entryIds } : t);
        setTimelines((prev) => prev.map(update));
        setActiveTimeline((curr) => (curr?.id === id ? { ...curr, entryIds } : curr));
    }, []);

    const addEntryToTimeline = useCallback(
        async (timelineId: number, entryId: number) => {
            const timeline = timelines.find((t) => t.id === timelineId);
            if (timeline?.isDefault || timeline?.entryIds.includes(entryId)) return;

            if (await api.addEntryToTimeline(timelineId, entryId)) {
                updateTimelineState(timelineId, [...timeline!.entryIds, entryId]);
            }
        },
        [timelines, updateTimelineState],
    );

    const removeEntryFromTimeline = useCallback(
        async (timelineId: number, entryId: number) => {
            const timeline = timelines.find((t) => t.id === timelineId);
            if (timeline?.isDefault || !timeline?.entryIds.includes(entryId)) return;

            if (await api.removeEntryFromTimeline(timelineId, entryId)) {
                updateTimelineState(
                    timelineId,
                    timeline.entryIds.filter((id) => id !== entryId),
                );
            }
        },
        [timelines, updateTimelineState],
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
