import { type User } from '../types';
import { API_BASE_URL, getHeaders } from './client';

export const getRelationships = async (): Promise<User[]> => {
    const res = await fetch(`${API_BASE_URL}/relationships`, {
        headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `Error: ${res.status}`);
    return data;
};

export const getRelationshipRequests = async (): Promise<{
    pending: User[];
    sent: User[];
}> => {
    const res = await fetch(`${API_BASE_URL}/relationships/requests`, {
        headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `Error: ${res.status}`);
    return data;
};

export const searchUsers = async (query: string): Promise<User[]> => {
    const res = await fetch(`${API_BASE_URL}/relationships/search?q=${encodeURIComponent(query)}`, {
        headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `Error: ${res.status}`);
    return data;
};

export const sendRelationshipRequest = async (targetId: number) => {
    const res = await fetch(`${API_BASE_URL}/relationships`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ target_id: targetId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `Error: ${res.status}`);
    return data;
};

export const acceptRelationshipRequest = async (userId: number) => {
    const res = await fetch(`${API_BASE_URL}/relationships/${userId}/accept`, {
        method: 'POST',
        headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `Error: ${res.status}`);
    return data;
};

export const deleteRelationship = async (userId: number) => {
    const res = await fetch(`${API_BASE_URL}/relationships/${userId}`, {
        method: 'DELETE',
        headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `Error: ${res.status}`);
    return data;
};

export const blockUser = async (userId: number) => {
    const res = await fetch(`${API_BASE_URL}/relationships/${userId}/block`, {
        method: 'POST',
        headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `Error: ${res.status}`);
    return data;
};
