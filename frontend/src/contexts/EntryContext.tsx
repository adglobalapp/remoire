import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getEntries, createEntry as apiCreateEntry, updateEntry as apiUpdateEntry, deleteEntry as apiDeleteEntry } from '../api/entries';
import { type Entry, type EntryContextValue, type EntryProviderProps } from '../types';
import { useAutoSave } from '../hooks/useAutoSave';
import { useAuth } from './AuthContext';

export const EntryContext = createContext<EntryContextValue | null>(null);

export const EntryProvider = ({ children }: EntryProviderProps) => {
    const [entries, setEntries] = useState<Entry[]>([]);
    const [activeEntry, setActiveEntry] = useState<Entry | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { saveEntry } = useAutoSave(setEntries, setActiveEntry);

    const { token } = useAuth();

    useEffect(() => {
        if (!token) {
            setEntries([]);
            setActiveEntry(null);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        getEntries()
            .then(async (data) => {
                if (data && data.length > 0) {
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
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [token]);

    const selectEntry = useCallback((entry: Entry) => {
        setActiveEntry(entry);
    }, []);

    const createEntry = useCallback(async () => {
        const newEntry = await apiCreateEntry('Untitled');
        if (!newEntry) {
            toast.error('Failed to create entry.');
            return;
        }
        setEntries((prev) => [newEntry, ...prev]);
        setActiveEntry(newEntry);
        toast.success('New entry created!');
    }, []);

    const deleteEntry = useCallback(async (id: number) => {
        const ok = await apiDeleteEntry(id);
        if (!ok) {
            toast.error('Failed to delete entry.');
            return;
        }
        setEntries((prev) => {
            const next = prev.filter((e) => e.id !== id);
            setActiveEntry((curr) => {
                if (curr?.id === id) return next.length > 0 ? next[0] : null;
                return curr;
            });
            return next;
        });
        toast.success('Entry deleted.');
    }, []);

    const updateEntryTitle = useCallback(async (id: number, title: string) => {
        setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, title } : e)));
        setActiveEntry((prev) => (prev?.id === id ? { ...prev, title } : prev));
        await apiUpdateEntry(id, { title });
    }, []);

    const updateEntry = useCallback(async (id: number, data: any) => {
        const updated = await apiUpdateEntry(id, data);
        if (!updated) return;
        setEntries((prev) => prev.map((e) => (e.id === id ? updated : e)));
        setActiveEntry((prev) => (prev?.id === id ? updated : prev));
    }, []);

    return (
        <EntryContext.Provider
            value={{
                entries,
                activeEntry,
                isLoading,
                selectEntry,
                createEntry,
                deleteEntry,
                saveEntry,
                updateEntryTitle,
                updateEntry,
            }}
        >
            {children}
        </EntryContext.Provider>
    );
};

export const useEntryContext = () => {
    const ctx = useContext(EntryContext);
    if (!ctx) throw new Error('useEntryContext must be used inside EntryProvider');
    return ctx;
};
