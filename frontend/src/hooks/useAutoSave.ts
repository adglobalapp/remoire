import { useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { updateEntry as apiUpdateEntry } from '../api/entries';
import { type Entry } from '../types';

export const useAutoSave = (
    setEntries: React.Dispatch<React.SetStateAction<Entry[]>>,
    setActiveEntry: React.Dispatch<React.SetStateAction<Entry | null>>
) => {
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
            toast.error('Failed to save changes.', { id: 'save-error' });
        } finally {
            savingRef.current = false;
            processQueue();
        }
    }, [setEntries, setActiveEntry]);

    const saveEntry = useCallback((id: number, title: string, content: string) => {
        pendingSavesRef.current.set(id, { title, content });
        processQueue();
    }, [processQueue]);

    return { saveEntry };
};
