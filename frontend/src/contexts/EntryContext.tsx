import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { getEntries, createEntry as apiCreateEntry, updateEntry as apiUpdateEntry, deleteEntry as apiDeleteEntry } from '../services/api';
import { type Entry, type EntryContextValue, type EntryProviderProps } from '../types';

export const EntryContext = createContext<EntryContextValue | null>(null);

export const EntryProvider = ({ children }: EntryProviderProps) => {

    const [entries, setEntries] = useState<Entry[]>([]);
    const [activeEntry, setActiveEntry] = useState<Entry | null>(null);

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
        if (!newEntry) return;
        setEntries(prev => [newEntry, ...prev]);
        setActiveEntry(newEntry); // new entry becomes active
    }, []);

    const deleteEntry = useCallback(async (id: number) => {
        const ok = await apiDeleteEntry(id);
        if (!ok) return;
        setEntries(prev => {
            const next = prev.filter(e => e.id !== id);
            setActiveEntry(curr => {
                // if we delete the active entry, show the next one, or null if no entries left
                if (curr?.id === id) return next.length > 0 ? next[0] : null;
                return curr;
            });
            return next;
        });
    }, []);

    // Auto-save logic
    const savingRef = useRef(false);
    const pendingSavesRef = useRef<Map<number, { title: string, content: string }>>(new Map());

    const processQueue = useCallback(async () => { // save queue to prevent server overload
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

    // save entry in database
    const saveEntry = useCallback((id: number, title: string, content: string) => {
        pendingSavesRef.current.set(id, { title, content });
        processQueue();
    }, [processQueue]);

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

    return (
        <EntryContext.Provider value={{ entries, activeEntry, selectEntry, createEntry, deleteEntry, saveEntry, updateEntryTitle, updateEntryDate, updateEntryMetadata }}>
            {children}
        </EntryContext.Provider>
    );
};

export const useEntryContext = () => {
    const ctx = useContext(EntryContext);
    if (!ctx) throw new Error('useEntryContext must be used inside EntryProvider');
    return ctx;
};
