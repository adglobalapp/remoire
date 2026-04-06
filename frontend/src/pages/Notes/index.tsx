import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import Loader from '../../components/common/Loader';
import toast from 'react-hot-toast';
import Navbar from '../../components/common/Navbar';
import styles from './index.module.css';
import { type Note as NoteType } from '../../types';
import { getNotes, createNote, updateNote, deleteNote } from '../../api';
import Note from './components/Note/Note';
import NoteModal from './components/Modal/NoteModal';
import Confirmation from '../../components/common/modal/Confirmation';

const NotesPage = () => {
    const [notes, setNotes] = useState<NoteType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedNote, setSelectedNote] = useState<NoteType | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [noteToDelete, setNoteToDelete] = useState<number | null>(null);

    const sortNotes = (data: NoteType[]) => {
        return [...data].sort((a, b) => {
            if (a.is_pinned && !b.is_pinned) return -1;
            if (!a.is_pinned && b.is_pinned) return 1;
            return b.id - a.id;
        });
    };

    const fetchNotes = async () => {
        setIsLoading(true);
        try {
            const data = await getNotes();
            setNotes(sortNotes(data));
        } catch (error) {
            toast.error('Failed to load notes');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotes();
    }, []);

    const handleSaveNote = async (data: Partial<NoteType>) => {
        try {
            if (selectedNote) {
                const updated = await updateNote(selectedNote.id, data);
                if (updated) {
                    setNotes(prev => sortNotes(prev.map(n => n.id === updated.id ? updated : n)));
                    toast.success('Note updated');
                }
            } else {
                const created = await createNote(data);
                if (created) {
                    setNotes(prev => sortNotes([created, ...prev]));
                    toast.success('Note created');
                }
            }
            setSelectedNote(null);
            setShowAddModal(false);
        } catch (error) {
            toast.error('Failed to save note');
        }
    };

    const handleDeleteNote = async () => {
        if (!noteToDelete) return;
        try {
            const success = await deleteNote(noteToDelete);
            if (success) {
                setNotes(prev => prev.filter(n => n.id !== noteToDelete));
                toast.success('Note deleted');
                setNoteToDelete(null);
            }
        } catch (error) {
            toast.error('Failed to delete note');
        }
    };

    return (
        <div className="page-container">
            <Navbar />
            <main className={styles.mainContent}>
                <div className={styles.container}>
                    <header className={styles.header}>
                        <h1>Notes</h1>
                        <div className={styles.actionButtons}>
                            <button className={`btn ${styles.addNoteBtn}`} onClick={() => setShowAddModal(true)}>
                                <Plus size={20} /> Add Note
                            </button>
                        </div>
                    </header>

                    {isLoading ? (
                        <Loader className={styles.loaderContainer} />
                    ) : notes.length === 0 ? (
                        <div className={`${styles.emptyStateContainer} empty-state-placeholder`}>
                            <p>No notes yet. Click "Add Note" to create one!</p>
                        </div>
                    ) : (
                        <div className={styles.notesGrid}>
                            {notes.map((note, i) => (
                                <Note
                                    key={note.id}
                                    note={note}
                                    index={i}
                                    onClick={() => setSelectedNote(note)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {(showAddModal || selectedNote) && (
                    <NoteModal
                        note={selectedNote}
                        onClose={() => {
                            setSelectedNote(null);
                            setShowAddModal(false);
                        }}
                        onSave={handleSaveNote}
                        onDelete={(id) => {
                            setSelectedNote(null);
                            setNoteToDelete(id);
                        }}
                    />
                )}

                {noteToDelete && (
                    <Confirmation
                        title="Delete Note?"
                        variant="danger"
                        message={
                            <span>Are you sure you want to delete <strong>{notes.find(n => n.id === noteToDelete)?.title || 'Untitled'}</strong>? This action cannot be undone.</span>
                        }
                        confirmText="Delete"
                        onConfirm={handleDeleteNote}
                        onCancel={() => setNoteToDelete(null)}
                    />
                )}
            </main>
        </div>
    );
};

export default NotesPage;
