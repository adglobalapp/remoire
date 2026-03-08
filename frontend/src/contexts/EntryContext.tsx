import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { type Entry, getEntries, createEntry as apiCreateEntry, updateEntry as apiUpdateEntry, deleteEntry as apiDeleteEntry } from '../services/api';

interface EntryContextValue {
    entries: Entry[];
    activeEntry: Entry | null;
    selectEntry: (entry: Entry) => void;
    createEntry: () => Promise<void>;
    deleteEntry: (id: number) => Promise<void>;
    saveEntry: (id: number, title: string, content: string) => void;
    updateEntryTitle: (id: number, title: string) => void;
}

const EntryContext = createContext<EntryContextValue | null>(null);

export const EntryProvider = ({ children }: { children: ReactNode }) => {
    const [entries, setEntries] = useState<Entry[]>([]);
    const [activeEntry, setActiveEntry] = useState<Entry | null>(null);
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        getEntries().then(async data => {
            if (data.length > 0) {
                setEntries(data);
                setActiveEntry(data[0]);
            } else if (!localStorage.getItem('remoire_initialized')) {
                localStorage.setItem('remoire_initialized', '1');
                const newEntry = await apiCreateEntry('Untitled');
                if (newEntry) {
                    setEntries([newEntry]);
                    setActiveEntry(newEntry);
                }
            }
        });
    }, []);

    const selectEntry = useCallback((entry: Entry) => {
        setActiveEntry(entry);
    }, []);

    const createEntry = useCallback(async () => {
        const newEntry = await apiCreateEntry('Untitled');
        if (!newEntry) return;
        setEntries(prev => [newEntry, ...prev]);
        setActiveEntry(newEntry);
    }, []);

    const deleteEntry = useCallback(async (id: number) => {
        const ok = await apiDeleteEntry(id);
        if (!ok) return;
        setEntries(prev => {
            const next = prev.filter(e => e.id !== id);
            setActiveEntry(curr => {
                if (curr?.id === id) return next.length > 0 ? next[0] : null;
                return curr;
            });
            return next;
        });
    }, []);

    const saveEntry = useCallback((id: number, title: string, content: string) => {
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(async () => {
            const updated = await apiUpdateEntry(id, { title, content });
            if (!updated) return;
            setEntries(prev => prev.map(e => e.id === id ? { ...e, title: updated.title, content: updated.content, updated_at: updated.updated_at } : e));
        }, 1000);
    }, []);

    const updateEntryTitle = useCallback((id: number, title: string) => {
        setEntries(prev => prev.map(e => e.id === id ? { ...e, title } : e));
        setActiveEntry(prev => prev?.id === id ? { ...prev, title } : prev);
    }, []);

    return (
        <EntryContext.Provider value={{ entries, activeEntry, selectEntry, createEntry, deleteEntry, saveEntry, updateEntryTitle }}>
            {children}
        </EntryContext.Provider>
    );
};

export const useEntryContext = () => {
    const ctx = useContext(EntryContext);
    if (!ctx) throw new Error('useEntryContext must be used inside EntryProvider');
    return ctx;
};
