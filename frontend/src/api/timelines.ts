import { type Timeline } from '../types';
import { API_BASE_URL, getHeaders } from './client';

export const getTimelines = async (): Promise<Timeline[]> => {
    const res = await fetch(`${API_BASE_URL}/timelines`, {
        headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `Error: ${res.status}`);
    return data;
};

export const createTimeline = async (name: string): Promise<Timeline> => {
    const res = await fetch(`${API_BASE_URL}/timelines`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `Error: ${res.status}`);
    return data;
};

export const deleteTimeline = async (id: number) => {
    const res = await fetch(`${API_BASE_URL}/timelines/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `Error: ${res.status}`);
    return data;
};

export const addEntryToTimeline = async (timelineId: number, entryId: number) => {
    const res = await fetch(`${API_BASE_URL}/timelines/${timelineId}/entries/${entryId}`, {
        method: 'POST',
        headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `Error: ${res.status}`);
    return data;
};

export const removeEntryFromTimeline = async (timelineId: number, entryId: number) => {
    const res = await fetch(`${API_BASE_URL}/timelines/${timelineId}/entries/${entryId}`, {
        method: 'DELETE',
        headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `Error: ${res.status}`);
    return data;
};
