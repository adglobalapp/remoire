import type { Note } from './models';

export interface NoteProps {
    note: Note;
    onClick: () => void;
    index?: number;
}

export interface NoteModalProps {
    note?: Note | null;
    onClose: () => void;
    onSave: (data: Partial<Note>) => void;
    onDelete?: (id: number) => void;
}

export interface ChecklistItem {
    completed: boolean;
    text: string;
}
