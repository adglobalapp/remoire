import { type ReactNode } from 'react';
import { type Editor } from '@tiptap/react';

export interface Entry {
    id: number;
    user_id: number;
    title: string;
    date: string;
    content: string | null;
    image_url?: string;
    color?: string | null;
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

export interface LoginCredentials {
    email: string;
    password?: string;
}

export interface RegisterCredentials {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export type Page = 'landing' | 'entries' | 'timelines' | 'friends';

export interface PageSettings {
    backgroundUrl: string | null;
    paddingTop: number;
    paddingRight: number;
    paddingBottom: number;
    paddingLeft: number;
}

export const DEFAULT_PAGE_SETTINGS: PageSettings = {
    backgroundUrl: null,
    paddingTop: 56,
    paddingRight: 75,
    paddingBottom: 56,
    paddingLeft: 75,
};

export interface EntryContextValue {
    entries: Entry[];
    activeEntry: Entry | null;
    selectEntry: (entry: Entry) => void;
    createEntry: () => Promise<void>;
    deleteEntry: (id: number) => Promise<void>;
    saveEntry: (id: number, title: string, content: string) => void;
    updateEntryTitle: (id: number, title: string) => void;
    updateEntryDate: (id: number, date: string) => Promise<void>;
    updateEntryMetadata: (id: number, data: Partial<Entry>) => Promise<void>;
    updateEntryParticipants: (id: number, participantIds: number[]) => Promise<void>;
}

export interface EntryProviderProps {
    children: ReactNode;
}

export interface Timeline {
    id: number;
    name: string;
    isDefault: boolean;
    entryIds: number[];
}

export interface TimelineContextValue {
    timelines: Timeline[];
    activeTimeline: Timeline | null;
    selectTimeline: (timeline: Timeline) => void;
    createTimeline: (name: string) => Promise<void>;
    deleteTimeline: (id: number) => Promise<void>;
    addEntryToTimeline: (timelineId: number, entryId: number) => Promise<void>;
    removeEntryFromTimeline: (timelineId: number, entryId: number) => Promise<void>;
    isLoading: boolean;
}

export interface TimelineProviderProps {
    children: ReactNode;
}

export type FontSizeOptions = {
    types: string[],
};

export interface ResizableImageAttributes {
    src: string;
    alt?: string;
    title?: string;
    width?: number;
    height?: number;
    x?: number;
    y?: number;
    rotation?: number;
}

export interface EditorToolbarProps {
    editor: Editor | null;
    isDragMode?: boolean;
    onToggleDragMode?: () => void;
    onColorPickerToggle?: (active: boolean) => void;
    pageSettings?: PageSettings;
    onPageSettingsChange?: (settings: PageSettings) => void;
}

export interface TimelineNodeProps {
    entry: Entry;
    side: 'left' | 'right';
}

export interface AddTimelineNodeModalProps {
    onClose: () => void;
    entryToEdit?: Entry;
}

export interface EntryPreviewModalProps {
    entry: Entry;
    onClose: () => void;
}

export interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: ReactNode;
}
