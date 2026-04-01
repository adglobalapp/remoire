import { type Entry } from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

export const getEntries = async (): Promise<Entry[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/entries`, {
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        });
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch entries:', error);
        return [];
    }
};

export const getEntry = async (id: number): Promise<Entry | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/entries/${id}`, {
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        });
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch entry:', error);
        return null;
    }
};

export const createEntry = async (title: string): Promise<Entry | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/entries`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
                title,
                date: new Date().toISOString().split('T')[0],
                content: null,
                user_id: 1,
            }),
        });
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Failed to create entry:', error);
        return null;
    }
};

export const updateEntry = async (
    id: number,
    data: Partial<Pick<Entry, 'title' | 'date' | 'content' | 'color' | 'cover_image'>>
): Promise<Entry | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/entries/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Failed to update entry:', error);
        return null;
    }
};

export const deleteEntry = async (id: number): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE_URL}/entries/${id}`, {
            method: 'DELETE',
            headers: { 'Accept': 'application/json' },
        });
        return response.ok;
    } catch (error) {
        console.error('Failed to delete entry:', error);
        return false;
    }
};

export const uploadImage = async (file: File): Promise<{ url?: string; error?: string }> => {
    try {
        const formData = new FormData();
        formData.append('image', file);
        const response = await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            const errorMessage = data.message || (data.errors ? Object.values(data.errors).flat().join(' ') : `Error: ${response.status}`);
            throw new Error(errorMessage);
        }

        return { url: data.url };
    } catch (error: any) {
        console.error('Failed to upload image:', error);
        return { error: error.message || 'Unknown upload error' };
    }
};