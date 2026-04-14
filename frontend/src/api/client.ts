export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const getHeaders = (isMultipart = false) => {
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
