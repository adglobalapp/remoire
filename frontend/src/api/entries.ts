import { type Entry, type ApiError } from '../types';
import { API_BASE_URL, getHeaders } from './client';

export const getEntries = async (): Promise<Entry[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/entries`, {
            headers: getHeaders(),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        return data;
    } catch {
        return [];
    }
};

export const createEntry = async (title: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/entries`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
                title,
                date: new Date().toISOString().split('T')[0],
            }),
        });

        const data = await response.json();
        if (!response.ok) {
            let errorMessage = data.message || 'Failed to create entry';
            if (data.errors) {
                errorMessage = Object.values(data.errors).flat().join(' ');
            }
            throw new Error(errorMessage);
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
        const response = await fetch(`${API_BASE_URL}/entries/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            let errorMessage = data.message || 'Failed to update entry';
            if (data.errors) {
                errorMessage = Object.values(data.errors).flat().join(' ');
            }
            const error = new Error(errorMessage) as ApiError;
            error.status = response.status;
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
        const response = await fetch(`${API_BASE_URL}/entries/${id}`, {
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

export const uploadImage = async (file: File): Promise<{ url?: string; message?: string; error?: string }> => {
    try {
        const formData = new FormData();
        formData.append('image', file);
        const response = await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            headers: getHeaders(true),
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            let errorMessage = `Error: ${response.status}`;
            if (data.errors) {
                errorMessage = Object.values(data.errors).flat().join(' ');
            } else if (data.message) {
                errorMessage = data.message;
            }
            throw new Error(errorMessage);
        }

        return { url: data.url, message: data.message };
    } catch (error) {
        const err = error as Error;
        return { error: err.message || 'Unknown upload error' };
    }
};
