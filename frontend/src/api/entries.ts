import { type Entry, type ApiError } from '../types';
import { API_BASE_URL, getHeaders } from './client';

export const getEntries = async (): Promise<Entry[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/entries`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        return await response.json();
    } catch (error) {
        return [];
    }
};
export const createEntry = async (title: string): Promise<Entry | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/entries`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
                title,
                date: new Date().toISOString().split('T')[0],
            }),
        });

        const resData = await response.json();
        if (!response.ok) {
            let errorMessage = resData.message || 'Failed to create entry';
            if (resData.errors) {
                errorMessage = Object.values(resData.errors).flat().join(' ');
            }
            throw new Error(errorMessage);
        }
        return resData;
    } catch (error) {
        return null;
    }
};

export const updateEntry = async (
    id: number,
    data: Partial<Pick<Entry, 'title' | 'date' | 'content' | 'color' | 'image_url' | 'location_name' | 'latitude' | 'longitude'>> & {
        participant_ids?: number[];
    },
): Promise<Entry | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/entries/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });

        const resData = await response.json();

        if (!response.ok) {
            let errorMessage = resData.message || 'Failed to update entry';
            if (resData.errors) {
                errorMessage = Object.values(resData.errors).flat().join(' ');
            }
            const error = new Error(errorMessage) as ApiError;
            error.status = response.status;
            error.errors = resData.errors;
            throw error;
        }

        return resData;
    } catch (error) {
        return null;
    }
};

export const deleteEntry = async (id: number): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE_URL}/entries/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        return response.ok;
    } catch (error) {
        return false;
    }
};

export const uploadImage = async (file: File): Promise<{ url?: string; error?: string }> => {
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

        return { url: data.url };
    } catch (error) {
        const err = error as Error;
        return { error: err.message || 'Unknown upload error' };
    }
};
