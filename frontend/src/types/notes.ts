import type { Note } from './models';

export interface NoteProps {
    note: Note;
    onClick: () => void;
    index?: number;
}

export interface NoteModalProps {
    note?: Note | null;
    onClose: () => void;
    onSave: (data: Partial<Note>) => Promise<void>;
    onDelete?: (id: number) => void;
}
