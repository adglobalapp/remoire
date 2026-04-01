import { type Entry, type Timeline, type User, type LoginCredentials, type RegisterCredentials } from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

const getHeaders = (isMultipart = false) => {
    const token = localStorage.getItem('auth_token');
    const headers: Record<string, string> = {
        'Accept': 'application/json',
    };
    if (!isMultipart) {
        headers['Content-Type'] = 'application/json';
    }
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

export const login = async (credentials: LoginCredentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(credentials),
    });
    const data = await response.json();
    if (!response.ok) {
        const error = new Error(data.message || 'Login failed') as any;
        error.errors = data.errors;
        throw error;
    }
    return data;
};

export const register = async (credentials: RegisterCredentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(credentials),
    });
    const data = await response.json();
    if (!response.ok) {
        const error = new Error(data.message || 'Registration failed') as any;
        error.errors = data.errors;
        throw error;
    }
    return data;
};

export const getCurrentUser = async (): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: getHeaders(),
    });
    if (!response.ok) {
        const error = new Error('Unauthorized') as any;
        error.status = response.status;
        throw error;
    }
    return await response.json();
};

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

export const getEntry = async (id: number): Promise<Entry | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/entries/${id}`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        return await response.json();
    } catch (error) {
        return null;
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
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        return await response.json();
    } catch (error) {
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
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        return await response.json();
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
            const errorMessage = data.message || (data.errors ? Object.values(data.errors).flat().join(' ') : `Error: ${response.status}`);
            throw new Error(errorMessage);
        }

        return { url: data.url };
    } catch (error: any) {
        return { error: error.message || 'Unknown upload error' };
    }
};

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