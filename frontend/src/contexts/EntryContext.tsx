import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getEntries, createEntry as apiCreateEntry, updateEntry as apiUpdateEntry, deleteEntry as apiDeleteEntry } from '../api/entries';
import { type Entry, type EntryContextValue, type EntryProviderProps } from '../types';
import { useAutoSave } from '../hooks/useAutoSave';

export const EntryContext = createContext<EntryContextValue | null>(null);

export const EntryProvider = ({ children }: EntryProviderProps) => {
    const [entries, setEntries] = useState<Entry[]>([]);
    const [activeEntry, setActiveEntry] = useState<Entry | null>(null);
    const { saveEntry } = useAutoSave(setEntries, setActiveEntry);

    // Initialization
    useEffect(() => {
        getEntries().then(async data => {
            if (data.length > 0) {
                setEntries(data);
                setActiveEntry(data[0]);
            } else if (!localStorage.getItem('remoire_initialized')) {
                // automatically create new Untitled entry on first run
                localStorage.setItem('remoire_initialized', '1');
                const newEntry = await apiCreateEntry('Untitled');
                if (newEntry) {
                    setEntries([newEntry]);
                    setActiveEntry(newEntry);
                }
            }
        });
    }, []);

    // Entry management
    const selectEntry = useCallback((entry: Entry) => {
        setActiveEntry(entry);
    }, []);

    const createEntry = useCallback(async () => {
        const newEntry = await apiCreateEntry('Untitled');
        if (!newEntry) {
            toast.error('Failed to create entry.');
            return;
        }
        setEntries(prev => [newEntry, ...prev]);
        setActiveEntry(newEntry);
        toast.success('New entry created!');
    }, []);

    const deleteEntry = useCallback(async (id: number) => {
        const ok = await apiDeleteEntry(id);
        if (!ok) {
            toast.error('Failed to delete entry.');
            return;
        }
        setEntries(prev => {
            const next = prev.filter(e => e.id !== id);
            setActiveEntry(curr => {
                if (curr?.id === id) return next.length > 0 ? next[0] : null;
                return curr;
            });
            return next;
        });
        toast.success('Entry deleted.');
    }, []);

    // update entry title on screen (live)
    const updateEntryTitle = useCallback((id: number, title: string) => {
        setEntries(prev => prev.map(e => e.id === id ? { ...e, title } : e));
        setActiveEntry(prev => prev?.id === id ? { ...prev, title } : prev);
    }, []);

    // update entry date and persist to API
    const updateEntryDate = useCallback(async (id: number, date: string) => {
        const updated = await apiUpdateEntry(id, { date });
        if (!updated) return;
        setEntries(prev => prev.map(e => e.id === id ? updated : e));
        setActiveEntry(prev => prev?.id === id ? updated : prev);
    }, []);

    // update entry metadata like color and cover_image
    const updateEntryMetadata = useCallback(async (id: number, data: Partial<Entry>) => {
        const updated = await apiUpdateEntry(id, data);
        if (!updated) return;
        setEntries(prev => prev.map(e => e.id === id ? updated : e));
        setActiveEntry(prev => prev?.id === id ? updated : prev);
    }, []);

    // update entry participants
    const updateEntryParticipants = useCallback(async (id: number, participantIds: number[]) => {
        const updated = await apiUpdateEntry(id, { participant_ids: participantIds } as any);
        if (!updated) return;
        setEntries(prev => prev.map(e => e.id === id ? updated : e));
        setActiveEntry(prev => prev?.id === id ? updated : prev);
    }, []);

    return (
        <EntryContext.Provider value={{ entries, activeEntry, selectEntry, createEntry, deleteEntry, saveEntry, updateEntryTitle, updateEntryDate, updateEntryMetadata, updateEntryParticipants }}>
            {children}
        </EntryContext.Provider>
    );
};

export const useEntryContext = () => {
    const ctx = useContext(EntryContext);
    if (!ctx) throw new Error('useEntryContext must be used inside EntryProvider');
    return ctx;
};
