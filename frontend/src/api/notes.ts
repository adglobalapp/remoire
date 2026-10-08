import { type Note } from '../types';
import { API_BASE_URL, getHeaders } from './client';

export const getNotes = async (): Promise<Note[]> => {
    const res = await fetch(`${API_BASE_URL}/notes`, {
        headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `Error: ${res.status}`);
    return data;
};

export const createNote = async (payload: Partial<Note>) => {
    const res = await fetch(`${API_BASE_URL}/notes`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `Error: ${res.status}`);
    return data;
};

export const updateNote = async (id: number, payload: Partial<Note>) => {
    const res = await fetch(`${API_BASE_URL}/notes/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `Error: ${res.status}`);
    return data;
};

export const deleteNote = async (id: number) => {
    const res = await fetch(`${API_BASE_URL}/notes/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `Error: ${res.status}`);
    return data;
};
