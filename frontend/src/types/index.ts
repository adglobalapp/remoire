import { type ReactNode } from 'react';

export interface Entry {
    id: number;
    title: string;
    date: string;
    content: string | null;
    image_url?: string;
    color?: string | null;
    cover_image?: string | null;
    user_id: number;
    created_at: string;
    updated_at: string;
}

export type Page = 'entries' | 'timelines';


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
}

export interface EntryProviderProps {
    children: ReactNode;
}

export interface TimelineProviderProps {
    children: ReactNode;
}


export interface Timeline {
    id: number;
    name: string;
    isDefault: boolean;
    entryIds: number[]; // empty means all (default timeline)
}

export interface TimelineContextValue {
    timelines: Timeline[];
    activeTimeline: Timeline | null;
    selectTimeline: (timeline: Timeline) => void;
    createTimeline: (name: string) => void;
    deleteTimeline: (id: number) => void;
    addEntryToTimeline: (timelineId: number, entryId: number) => void;
    removeEntryFromTimeline: (timelineId: number, entryId: number) => void;
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

import { type Editor } from '@tiptap/react';

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

