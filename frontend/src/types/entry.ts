import { type ReactNode } from 'react';
import { type Entry } from './models';

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
