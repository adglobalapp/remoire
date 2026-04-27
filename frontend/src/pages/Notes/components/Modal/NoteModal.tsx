import ReactDOM from 'react-dom';
import React, { useState, useEffect } from 'react';
import { Trash2, Bold, Italic, Underline, Heading1, Heading2, ListChecks, Type, Pin, X, Loader2 } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { type NoteModalProps } from '../../../../types';
import { PRESET_COLORS } from '../../../../utils/constants';
import styles from './NoteModal.module.css';

const NoteModal: React.FC<NoteModalProps> = ({ note, onClose, onSave, onDelete }) => {
    const [title, setTitle] = useState(note?.title || '');
    const [color, setColor] = useState(note?.color || '#fdf9f3');
    const [isPinned, setIsPinned] = useState(note?.is_pinned || false);
    const [isSaving, setIsSaving] = useState(false);

    const [, setSelectionCount] = useState(0);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2] },
            }),
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
        ],
        content: '<p></p>',
        editorProps: {
            attributes: {
                class: 'prose-editor focus:outline-none',
            },
        },
        onUpdate: () => setSelectionCount((s) => s + 1),
        onSelectionUpdate: () => setSelectionCount((s) => s + 1),
    });

    useEffect(() => {
        if (!editor || !note) return;

        const content = (note?.content as string) || '<p></p>';
        editor.commands.setContent(content);
    }, [note, editor]);

    const handleSave = async () => {
        if (!editor) return;
        setIsSaving(true);
        await onSave({
            title,
            content: editor.getHTML(),
            color,
            is_pinned: isPinned,
        });
        setIsSaving(false);
    };

    if (!editor) return null;

    return ReactDOM.createPortal(
        <div className="global-modal-overlay" onClick={onClose}>
            <div
                className={`${styles.modalContent} global-modal-content`}
                onClick={(e) => e.stopPropagation()}
                style={
                    {
                        '--note-bg': color,
                    } as React.CSSProperties
                }
            >
                <div className={styles.modalHeader}>
                    <input
                        type="text"
                        placeholder="Note Title..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={`${styles.titleInput} font-ui`}
                    />
                    <div className={styles.headerActions}>
                        <button
                            className={`${styles.headerBtn} ${isPinned ? styles.pinnedActive : ''}`}
                            onClick={() => setIsPinned(!isPinned)}
                            title={isPinned ? 'Unpin Note' : 'Pin Note'}
                        >
                            <Pin size={18} fill={isPinned ? 'currentColor' : 'none'} />
                        </button>
                        <button className={`${styles.closeBtnOverride} global-modal-close-btn`} onClick={onClose}>
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.editorContainer}>
                        <div className={styles.toolbar}>
                            <button
                                onClick={() => editor.chain().focus().setParagraph().run()}
                                className={`${styles.toolbarBtn} ${editor.isActive('paragraph') ? styles.active : ''}`}
                                title="Body Text"
                            >
                                <Type size={18} />
                            </button>

                            <div className={styles.toolbarDivider} />

                            <button
                                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                                className={`${styles.toolbarBtn} ${editor.isActive('heading', { level: 1 }) ? styles.active : ''}`}
                                title="Heading 1"
                            >
                                <Heading1 size={18} />
                            </button>
                            <button
                                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                                className={`${styles.toolbarBtn} ${editor.isActive('heading', { level: 2 }) ? styles.active : ''}`}
                                title="Heading 2"
                            >
                                <Heading2 size={18} />
                            </button>

                            <div className={styles.toolbarDivider} />

                            <button
                                onClick={() => editor.chain().focus().toggleBold().run()}
                                className={`${styles.toolbarBtn} ${editor.isActive('bold') ? styles.active : ''}`}
                                title="Bold"
                            >
                                <Bold size={18} />
                            </button>
                            <button
                                onClick={() => editor.chain().focus().toggleItalic().run()}
                                className={`${styles.toolbarBtn} ${editor.isActive('italic') ? styles.active : ''}`}
                                title="Italic"
                            >
                                <Italic size={18} />
                            </button>
                            <button
                                onClick={() => editor.chain().focus().toggleUnderline().run()}
                                className={`${styles.toolbarBtn} ${editor.isActive('underline') ? styles.active : ''}`}
                                title="Underline"
                            >
                                <Underline size={18} />
                            </button>

                            <div className={styles.toolbarDivider} />

                            <button
                                onClick={() => editor.chain().focus().toggleTaskList().run()}
                                className={`${styles.toolbarBtn} ${editor.isActive('taskList') ? styles.active : ''}`}
                                title="Checklist"
                            >
                                <ListChecks size={18} />
                            </button>
                        </div>
                        <EditorContent editor={editor} />
                    </div>
                </div>

                <div className={styles.modalFooter}>
                    <div className={styles.colorPalette}>
                        {PRESET_COLORS.map((c) => (
                            <div
                                key={c}
                                className={`${styles.colorCircle} ${color === c ? styles.selected : ''}`}
                                style={{ backgroundColor: c }}
                                onClick={() => setColor(c)}
                            />
                        ))}
                    </div>

                    <div className={styles.footerActions}>
                        {note && onDelete && (
                            <button className="btn btn-danger" onClick={() => onDelete(note.id)}>
                                <Trash2 size={18} /> Delete
                            </button>
                        )}
                        <button className="btn btn-dark" onClick={handleSave} disabled={isSaving}>
                            {isSaving ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" /> Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.getElementById('modal-root')!,
    );
};

export default NoteModal;
