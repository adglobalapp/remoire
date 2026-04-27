import { useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { updateEntry as apiUpdateEntry } from '../api/entries';
import { type Entry, type ApiError } from '../types';

export const useAutoSave = (
    setEntries: React.Dispatch<React.SetStateAction<Entry[]>>,
    setActiveEntry: React.Dispatch<React.SetStateAction<Entry | null>>,
) => {
    const isSaving = useRef(false);
    const processQueue = useRef<Map<number, { title: string; content: string }>>(new Map());

    const autoSave = useCallback(async function nextSave() {
        if (isSaving.current || processQueue.current.size === 0) return;

        isSaving.current = true;
        const entry = processQueue.current.entries().next().value;
        if (!entry) {
            isSaving.current = false;
            return;
        }

        const [id, data] = entry;
        processQueue.current.delete(id);

        try {
            await apiUpdateEntry(id, data);
        } catch (err: unknown) {
            const error = err as ApiError;
            toast.error(error.message || 'Failed to save changes.', { id: 'save-error' });
        } finally {
            isSaving.current = false;
            nextSave();
        }
    }, []);

    const dispatchSave = useCallback(
        (id: number, title: string, content: string) => {
            const data = { title, content };
            processQueue.current.set(id, data);

            setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...data } : e)));
            setActiveEntry((prev) => (prev?.id === id ? { ...prev, ...data } : prev));

            autoSave();
        },
        [autoSave, setEntries, setActiveEntry],
    );

    return { dispatchSave, isSaving: isSaving.current };
};
