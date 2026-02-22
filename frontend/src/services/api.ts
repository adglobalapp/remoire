export interface Entry {
    id: number;
    title: string;
    date: string;
    content: string;
    image_url?: string;
    user_id: number;
    created_at: string;
    updated_at: string;
}

const API_BASE_URL = 'http://localhost:8000/api';

export const getEntries = async (): Promise<Entry[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/entries`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Failed to fetch entries:', error);
        return [];
    }
};