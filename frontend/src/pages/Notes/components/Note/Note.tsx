import React from 'react';
import { Pin } from 'lucide-react';
import { type NoteProps } from '../../../../types';
import styles from './Note.module.css';

const Note: React.FC<NoteProps> = ({ note, onClick, index = 0 }) => {
    return (
        <div
            className={styles.noteCard}
            onClick={onClick}
            style={
                {
                    '--note-bg': note.color || '#ffffff',
                    '--delay': index,
                } as React.CSSProperties
            }
        >
            <div className={styles.donkeyEar} />

            <h3 className={styles.title}>{note.title || 'Untitled'}</h3>
            <div className={`${styles.preview} prose-preview`} dangerouslySetInnerHTML={{ __html: note.content || 'No content' }} />

            {note.is_pinned && (
                <div className={styles.pinIcon} title="Pinned Note">
                    <Pin />
                </div>
            )}
        </div>
    );
};

export default Note;
