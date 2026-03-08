import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { getEntries, createEntry as apiCreateEntry, updateEntry as apiUpdateEntry, deleteEntry as apiDeleteEntry } from '../services/api';
import { type Entry, type EntryContextValue } from '../types';

export const EntryContext = createContext<EntryContextValue | null>(null);

export const EntryProvider = ({ children }: { children: ReactNode }) => {
    const [entries, setEntries] = useState<Entry[]>([]);
    const [activeEntry, setActiveEntry] = useState<Entry | null>(null);

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

    const savingRef = useRef(false);
    const pendingSavesRef = useRef<Map<number, { title: string, content: string }>>(new Map());

    const processQueue = useCallback(async () => {
        if (savingRef.current || pendingSavesRef.current.size === 0) return;

        savingRef.current = true;
        const entry = pendingSavesRef.current.entries().next().value;
        if (!entry) {
            savingRef.current = false;
            return;
        }

        const [id, data] = entry;
        pendingSavesRef.current.delete(id);

        try {
            const updated = await apiUpdateEntry(id, data);
            if (updated) {
                setEntries(prev => prev.map(e => e.id === id ? updated : e));
                setActiveEntry(prev => prev?.id === id ? updated : prev);
            }
        } catch (error) {
            console.error('Save failed:', error);
        } finally {
            savingRef.current = false;
            processQueue();
        }
    }, []);

    const saveEntry = useCallback((id: number, title: string, content: string) => {
        pendingSavesRef.current.set(id, { title, content });
        processQueue();
    }, [processQueue]);

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
