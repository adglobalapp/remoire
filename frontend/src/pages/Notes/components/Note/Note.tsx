import React from 'react';
import { Pin } from 'lucide-react';
import { type NoteProps, type ChecklistItem } from '../../../../types';
import styles from './Note.module.css';

const Note: React.FC<NoteProps> = ({ note, onClick, index = 0 }) => {
    const renderContent = () => {
        const content = note.content || '';
        if (content.includes('data-type="taskList"') || content.includes('data-checked=')) {
            const checklistItems: ChecklistItem[] = Array.from(content.matchAll(/<li[^>]+data-checked="([^"]+)"[^>]*>.*?<p>(.*?)<\/p>/g))
                .slice(0, 6)
                .map(match => ({
                    completed: match[1] === 'true',
                    text: match[2].replace(/<[^>]*>/g, '')
                }));
            if (checklistItems.length > 0) {
                return (
                    <div className={styles.todoPreview}>
                        {checklistItems.map((todo, idx) => (
                            <div key={idx} className={`${styles.todoItem} ${todo.completed ? styles.completed : ''}`}>
                                <div className={`${styles.checkbox} ${todo.completed ? styles.checked : ''}`} />
                                <span className={`${styles.todoText} text-truncate`}>{todo.text}</span>
                            </div>
                        ))}
                    </div>
                );
            }
        }
        const stripped = content
            .replace(/<\/p>/g, '\n')
            .replace(/<br[^>]*>/g, '\n')
            .replace(/<[^>]+>/g, '')
            .trim();
        return <p className={styles.preview}>{stripped || 'No content'}</p>;
    };
    return (
        <div 
            className={styles.noteCard} 
            onClick={onClick}
            style={{ 
                '--note-bg': note.color || '#fff',
                '--delay': index,
            } as React.CSSProperties}
        >
            {note.is_pinned && (
                <div className={styles.pinIcon} title="Pinned Note">
                    <Pin size={14} fill="currentColor" strokeWidth={2.5} />
                </div>
            )}

            <div className={styles.donkeyEar} />

            <h3 className={styles.title}>
                {note.title || 'Untitled'}
            </h3>
            <div className={styles.body}>
                {renderContent()}
            </div>
        </div>
    );
};

export default Note;
