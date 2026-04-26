import { type Note } from '../types';
import { API_BASE_URL, getHeaders } from './client';

export const getNotes = async (): Promise<Note[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/notes`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        return await response.json();
    } catch {
        return [];
    }
};

export const createNote = async (data: Partial<Note>) => {
    try {
        const response = await fetch(`${API_BASE_URL}/notes`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        const resData = await response.json();
        if (!response.ok) throw new Error(resData.message || `Error: ${response.status}`);
        return resData;
    } catch (error) {
        throw error;
    }
};

export const updateNote = async (id: number, data: Partial<Note>) => {
    try {
        const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        const resData = await response.json();
        if (!response.ok) throw new Error(resData.message || `Error: ${response.status}`);
        return resData;
    } catch (error) {
        throw error;
    }
};

export const deleteNote = async (id: number) => {
    try {
        const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
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
