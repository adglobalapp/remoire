import { type ReactNode } from 'react';

export interface Entry {
    id: number;
    title: string;
    date: string;
    content: string | null;
    image_url?: string;
    user_id: number;
    created_at: string;
    updated_at: string;
}

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
}

export interface EntryProviderProps {
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

import { type Editor } from '@tiptap/react';

export interface EditorToolbarProps {
    editor: Editor | null;
    isDragMode?: boolean;
    onToggleDragMode?: () => void;
    onColorPickerToggle?: (active: boolean) => void;
    pageSettings?: PageSettings;
    onPageSettingsChange?: (settings: PageSettings) => void;
}
