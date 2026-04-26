import { type Timeline } from '../types';
import { API_BASE_URL, getHeaders } from './client';

export const getTimelines = async (): Promise<Timeline[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/timelines`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        return await response.json();
    } catch {
        return [];
    }
};

export const createTimeline = async (name: string): Promise<Timeline> => {
    try {
        const response = await fetch(`${API_BASE_URL}/timelines`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ name }),
        });
        const resData = await response.json();
        if (!response.ok) throw new Error(resData.message || `Error: ${response.status}`);
        return resData;
    } catch (error) {
        throw error;
    }
};

export const deleteTimeline = async (id: number) => {
    try {
        const response = await fetch(`${API_BASE_URL}/timelines/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || `Error: ${response.status}`);
        return data;
    } catch (error) {
        throw error;
    }
};

export const addEntryToTimeline = async (timelineId: number, entryId: number) => {
    try {
        const response = await fetch(`${API_BASE_URL}/timelines/${timelineId}/entries/${entryId}`, {
            method: 'POST',
            headers: getHeaders(),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || `Error: ${response.status}`);
        return data;
    } catch (error) {
        throw error;
    }
};

export const removeEntryFromTimeline = async (timelineId: number, entryId: number) => {
    try {
        const response = await fetch(`${API_BASE_URL}/timelines/${timelineId}/entries/${entryId}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || `Error: ${response.status}`);
        return data;
    } catch (error) {
        throw error;
    }
};
