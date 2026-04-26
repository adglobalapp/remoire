import { type User } from '../types';
import { API_BASE_URL, getHeaders } from './client';

export const getRelationships = async (): Promise<User[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/relationships`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        return await response.json();
    } catch {
        return [];
    }
};

export const getRelationshipRequests = async (): Promise<{
    pending: User[];
    sent: User[];
}> => {
    try {
        const response = await fetch(`${API_BASE_URL}/relationships/requests`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        return await response.json();
    } catch {
        return { pending: [], sent: [] };
    }
};

export const searchUsers = async (query: string): Promise<User[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/relationships/search?q=${encodeURIComponent(query)}`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        return await response.json();
    } catch {
        return [];
    }
};

export const sendRelationshipRequest = async (targetId: number) => {
    try {
        const response = await fetch(`${API_BASE_URL}/relationships`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ target_id: targetId }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || `Error: ${response.status}`);
        return data;
    } catch (error) {
        throw error;
    }
};

export const acceptRelationshipRequest = async (userId: number) => {
    try {
        const response = await fetch(`${API_BASE_URL}/relationships/${userId}/accept`, {
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

export const deleteRelationship = async (userId: number) => {
    try {
        const response = await fetch(`${API_BASE_URL}/relationships/${userId}`, {
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

export const blockUser = async (userId: number) => {
    try {
        const response = await fetch(`${API_BASE_URL}/relationships/${userId}/block`, {
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
