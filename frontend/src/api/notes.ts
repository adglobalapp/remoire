import { type Note } from '../types';
import { API_BASE_URL, getHeaders } from './client';

export const getNotes = async (): Promise<Note[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/notes`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        return await response.json();
    } catch (error) {
        return [];
    }
};

export const createNote = async (data: Partial<Note>): Promise<Note | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/notes`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        return await response.json();
    } catch (error) {
        return null;
    }
};

export const updateNote = async (id: number, data: Partial<Note>): Promise<Note | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
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

export const deleteNote = async (id: number): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        return response.ok;
    } catch (error) {
        return false;
    }
};
