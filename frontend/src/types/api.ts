export interface ApiError extends Error {
    status?: number;
    errors?: Record<string, string[]>;
}

export interface NominatimResult {
    place_id: number;
    lat: string;
    lon: string;
    display_name: string;
}
