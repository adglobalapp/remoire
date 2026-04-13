export interface Entry {
    id: number;
    user_id: number;
    title: string;
    date: string;
    content: string | null;
    image_url?: string;
    color?: string | null;
    location_name?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    created_at: string;
    updated_at: string;
    participants?: User[];
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar_url?: string | null;
    friend_code: string;
    bio?: string | null;
    last_seen_at?: string | null;
    created_at: string;
    friend_status?: 'none' | 'pending' | 'accepted' | 'blocked';
    is_requester?: boolean;
}

export interface FriendRelation {
    id: number;
    user_id: number;
    friend_id: number;
    status: 'pending' | 'accepted' | 'blocked';
    created_at: string;
    updated_at: string;
}

export interface Timeline {
    id: number;
    name: string;
    isDefault: boolean;
    entryIds: number[];
}

export interface Note {
    id: number;
    user_id: number;
    title: string | null;
    content: string | null;
    color: string | null;
    is_pinned: boolean;
    created_at: string;
    updated_at: string;
}
