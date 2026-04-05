import { type User } from '../types';
import { API_BASE_URL, getHeaders } from './client';

export const getFriends = async (): Promise<User[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/friends`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        return await response.json();
    } catch (error) {
        return [];
    }
};

export const getFriendRequests = async (): Promise<{ pending: User[], sent: User[] }> => {
    try {
        const response = await fetch(`${API_BASE_URL}/friends/requests`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        return await response.json();
    } catch (error) {
        return { pending: [], sent: [] };
    }
};

export const searchUsers = async (query: string): Promise<User[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/friends/search?q=${encodeURIComponent(query)}`, {
            headers: getHeaders(),
        });
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        return await response.json();
    } catch (error) {
        return [];
    }
};

export const sendFriendRequest = async (friendId: number): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE_URL}/friends`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ friend_id: friendId }),
        });
        return response.ok;
    } catch (error) {
        return false;
    }
};

export const acceptFriendRequest = async (userId: number): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE_URL}/friends/${userId}/accept`, {
            method: 'POST',
            headers: getHeaders(),
        });
        return response.ok;
    } catch (error) {
        return false;
    }
};

export const deleteFriendship = async (userId: number): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE_URL}/friends/${userId}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        return response.ok;
    } catch (error) {
        return false;
    }
};

export const blockUser = async (userId: number): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE_URL}/friends/${userId}/block`, {
            method: 'POST',
            headers: getHeaders(),
        });
        return response.ok;
    } catch (error) {
        return false;
    }
};
