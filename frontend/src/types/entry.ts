import { type ReactNode } from 'react';
import { type Entry } from './models';

export interface EntryContextValue {
    entries: Entry[];
    activeEntry: Entry | null;
    isLoading: boolean;
    selectEntry: (entry: Entry) => void;
    createEntry: () => Promise<void>;
    deleteEntry: (id: number) => Promise<void>;
    saveEntry: (id: number, title: string, content: string) => void;
    updateEntry: (id: number, data: Partial<Entry> & { participant_ids?: number[] }) => Promise<Entry & { message?: string }>;
}

export interface EntryProviderProps {
    children: ReactNode;
}
