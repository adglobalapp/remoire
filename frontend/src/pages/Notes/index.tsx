import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';
import Navbar from '../../components/common/Navbar';
import styles from './index.module.css';
import { useAuth } from '../../contexts/AuthContext';
import { type Note as NoteType, type ApiError } from '../../types';
import { getNotes, createNote, updateNote, deleteNote } from '../../api';
import Note from './components/Note/Note';
import NoteModal from './components/Modal/NoteModal';
import DeleteConfirmation from '../../components/common/DeleteConfirmation';

const NotesPage = () => {
    const { isAuthenticated } = useAuth();
    const [notes, setNotes] = useState<NoteType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedNote, setSelectedNote] = useState<NoteType | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [noteToDelete, setNoteToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchNotes = useCallback(async () => {
        if (!isAuthenticated) return;

        setIsLoading(true);
        try {
            const data = await getNotes();
            setNotes(data);
        } catch (err: unknown) {
            const error = err as ApiError;
            if (error.status !== 401) {
                toast.error(error.message || 'Failed to load notes');
            }
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    const handleSaveNote = async (data: Partial<NoteType>) => {
        if (selectedNote) {
            try {
                const updated = await updateNote(selectedNote.id, data);
                if (updated?.message) toast.success(updated.message);
                setSelectedNote(null);
                setShowAddModal(false);
                fetchNotes();
            } catch (err: unknown) {
                const error = err as ApiError;
                toast.error(error.message || 'Failed to update note');
            }
        } else {
            try {
                const created = await createNote(data);
                if (created?.message) toast.success(created.message);
                setSelectedNote(null);
                setShowAddModal(false);
                fetchNotes();
            } catch (err: unknown) {
                const error = err as ApiError;
                toast.error(error.message || 'Failed to create note');
            }
        }
    };

    const handleDeleteNote = async () => {
        if (!noteToDelete) return;
        setIsDeleting(true);
        try {
            const res = await deleteNote(noteToDelete);
            setNotes((prev) => prev.filter((n) => n.id !== noteToDelete));
            if (res?.message) toast.success(res.message);
            setNoteToDelete(null);
            setSelectedNote(null);
        } catch (err: unknown) {
            const error = err as ApiError;
            toast.error(error.message || 'Failed to delete note');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="page-container">
            <Navbar />
            <main className={styles.mainContent}>
                {isLoading && notes.length === 0 ? (
                    <Loader centered />
                ) : (
                    <div className={styles.container}>
                        <header className={styles.header}>
                            <h1>Notes</h1>
                            <div className={styles.actionButtons}>
                                <button className="btn btn-dark" onClick={() => setShowAddModal(true)}>
                                    <Plus size={20} /> Add Note
                                </button>
                            </div>
                        </header>

                        {notes.length === 0 ? (
                            <div className={`${styles.emptyStateContainer} empty-state-placeholder`}>
                                <p>No notes yet. Click "Add Note" to create one!</p>
                            </div>
                        ) : (
                            <div className={styles.notesGrid}>
                                {notes.map((note, i) => (
                                    <Note key={note.id} note={note} index={i} onClick={() => setSelectedNote(note)} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {(showAddModal || selectedNote) && (
                    <NoteModal
                        note={selectedNote}
                        onClose={() => {
                            setSelectedNote(null);
                            setShowAddModal(false);
                        }}
                        onSave={handleSaveNote}
                        onDelete={(id) => {
                            setNoteToDelete(id);
                        }}
                    />
                )}

                {noteToDelete && (
                    <DeleteConfirmation
                        title="Delete Note?"
                        message={
                            <span>
                                Are you sure you want to delete{' '}
                                <strong>{notes.find((n) => n.id === noteToDelete)?.title || 'Untitled'}</strong>? This action cannot be
                                undone.
                            </span>
                        }
                        confirmText="Delete"
                        isLoading={isDeleting}
                        loadingText="Deleting..."
                        onConfirm={handleDeleteNote}
                        onCancel={() => setNoteToDelete(null)}
                    />
                )}
            </main>
        </div>
    );
};

export default NotesPage;
