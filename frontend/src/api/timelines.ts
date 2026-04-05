import { type Timeline } from '../types';
import { API_BASE_URL, getHeaders } from './client';

export const getTimelines = async (): Promise<Timeline[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/timelines`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        return await response.json();
    } catch (error) {
        return [];
    }
};

export const createTimeline = async (name: string): Promise<Timeline | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/timelines`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ name }),
        });
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        return await response.json();
    } catch (error) {
        return null;
    }
};

export const deleteTimeline = async (id: number): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE_URL}/timelines/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        return response.ok;
    } catch (error) {
        return false;
    }
};

export const addEntryToTimeline = async (timelineId: number, entryId: number): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE_URL}/timelines/${timelineId}/entries/${entryId}`, {
            method: 'POST',
            headers: getHeaders(),
        });
        return response.ok;
    } catch (error) {
        return false;
    }
};

export const removeEntryFromTimeline = async (timelineId: number, entryId: number): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE_URL}/timelines/${timelineId}/entries/${entryId}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        return response.ok;
    } catch (error) {
        return false;
    }
};
