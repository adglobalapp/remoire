import { type Entry, type ApiError } from '../types';
import { API_BASE_URL, getHeaders } from './client';
import { toLocalDateString } from '../utils/dateUtils';

export const getEntries = async (): Promise<Entry[]> => {
    const res = await fetch(`${API_BASE_URL}/entries`, {
        headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `Error: ${res.status}`);
    return data;
};

export const createEntry = async (title: string) => {
    const res = await fetch(`${API_BASE_URL}/entries`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
            title,
            date: toLocalDateString(),
        }),
    });

    const data = await res.json();
    if (!res.ok) {
        const error = new Error(data.message || 'Failed to create entry') as ApiError;
        error.status = res.status;
        error.errors = data.errors;
        throw error;
    }
    return data;
};

export const updateEntry = async (
    id: number,
    payload: Partial<Pick<Entry, 'title' | 'date' | 'content' | 'color' | 'image_url' | 'location_name' | 'latitude' | 'longitude'>> & {
        participant_ids?: number[];
    },
) => {
    const res = await fetch(`${API_BASE_URL}/entries/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
        const error = new Error(data.message || 'Failed to update entry') as ApiError;
        error.status = res.status;
        error.errors = data.errors;
        throw error;
    }

    return data;
};

export const deleteEntry = async (id: number) => {
    const res = await fetch(`${API_BASE_URL}/entries/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `Error: ${res.status}`);
    return data;
};

export const uploadImage = async (file: File): Promise<{ url?: string; message?: string; error?: string }> => {
    try {
        const formData = new FormData();
        formData.append('image', file);
        const res = await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            headers: getHeaders(true),
            body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
            const error = new Error(data.message || `Error: ${res.status}`) as ApiError;
            error.status = res.status;
            error.errors = data.errors;
            throw error;
        }

        return { url: data.url, message: data.message };
    } catch (error) {
        const err = error as Error;
        return { error: err.message || 'Unknown upload error' };
    }
};
