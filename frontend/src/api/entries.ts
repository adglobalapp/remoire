import { type Entry, type ApiError } from '../types';
import { API_BASE_URL, getHeaders } from './client';

export const getEntries = async (): Promise<Entry[]> => {
    try {
        const res = await fetch(`${API_BASE_URL}/entries`, {
            headers: getHeaders(),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || `Error: ${res.status}`);
        return data;
    } catch (error) {
        throw error;
    }
};

export const createEntry = async (title: string) => {
    try {
        const res = await fetch(`${API_BASE_URL}/entries`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
                title,
                date: new Date().toISOString().split('T')[0],
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
    } catch (error) {
        throw error;
    }
};

export const updateEntry = async (
    id: number,
    payload: Partial<Pick<Entry, 'title' | 'date' | 'content' | 'color' | 'image_url' | 'location_name' | 'latitude' | 'longitude'>> & {
        participant_ids?: number[];
    },
) => {
    try {
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
    } catch (error) {
        throw error;
    }
};

export const deleteEntry = async (id: number) => {
    try {
        const res = await fetch(`${API_BASE_URL}/entries/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || `Error: ${res.status}`);
        return data;
    } catch (error) {
        throw error;
    }
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
