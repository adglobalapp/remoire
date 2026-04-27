import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getEntries, createEntry as apiCreateEntry, updateEntry as apiUpdateEntry, deleteEntry as apiDeleteEntry } from '../api/entries';
import { type Entry, type EntryContextValue, type EntryProviderProps, type ApiError } from '../types';
import { useAutoSave } from '../hooks/useAutoSave';

export const EntryContext = createContext<EntryContextValue | null>(null);

export const EntryProvider = ({ children }: EntryProviderProps) => {
    const [entries, setEntries] = useState<Entry[]>([]);
    const [activeEntry, setActiveEntry] = useState<Entry | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { saveEntry } = useAutoSave(setEntries, setActiveEntry);

    useEffect(() => {
        getEntries()
            .then(async (data) => {
                if (data && data.length > 0) {
                    setEntries(data);
                    setActiveEntry(data[0]);
                } else if (!localStorage.getItem('remoire_initialized')) {
                    localStorage.setItem('remoire_initialized', '1');
                    try {
                        const newEntry = await apiCreateEntry('Untitled');
                        if (newEntry) {
                            setEntries([newEntry]);
                            setActiveEntry(newEntry);
                        }
                    } catch (err) {
                        console.error('Failed to create initial entry:', err);
                    }
                }
            })
            .catch((err) => {
                console.error('Failed to fetch entries:', err);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    const selectEntry = useCallback((entry: Entry) => {
        setActiveEntry(entry);
    }, []);

    const createEntry = useCallback(async () => {
        try {
            const newEntry = await apiCreateEntry('Untitled');
            setEntries((prev) => [newEntry, ...prev]);
            setActiveEntry(newEntry);
            if (newEntry.message) toast.success(newEntry.message);
        } catch (err: unknown) {
            const error = err as ApiError;
            toast.error(error.message || 'Failed to create entry.');
        }
    }, []);

    const deleteEntry = useCallback(
        async (id: number) => {
            try {
                const res = await apiDeleteEntry(id);
                setEntries((prev) => {
                    const newList = prev.filter((e) => e.id !== id);
                    if (activeEntry?.id === id) {
                        setActiveEntry(newList[0] || null);
                    }
                    return newList;
                });
                if (res.message) toast.success(res.message);
            } catch (err: unknown) {
                const error = err as ApiError;
                toast.error(error.message || 'Failed to delete entry.');
            }
        },
        [activeEntry],
    );

    const updateEntry = useCallback(
        async (id: number, data: Partial<Entry>) => {
            const original = entries.find((e) => e.id === id);

            setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...data } : e)));
            setActiveEntry((prev) => (prev?.id === id ? { ...prev, ...data } : prev));

            try {
                const updated = await apiUpdateEntry(id, data);
                if (updated) {
                    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...updated } : e)));
                    setActiveEntry((prev) => (prev?.id === id ? { ...prev, ...updated } : prev));
                }
                return updated;
            } catch (err: unknown) {
                const error = err as ApiError;
                toast.error(error.message || 'Failed to save changes.');
                if (original) {
                    setEntries((prev) => prev.map((e) => (e.id === id ? original : e)));
                    setActiveEntry((prev) => (prev?.id === id ? original : prev));
                }
                throw error;
            }
        },
        [activeEntry],
    );

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
