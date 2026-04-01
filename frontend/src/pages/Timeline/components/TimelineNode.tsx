import { useState } from 'react';
import { type TimelineNodeProps } from '../../../types';
import styles from './TimelineNode.module.css';
import { MoreHorizontal } from 'lucide-react';
import EntryPreviewModal from './EntryPreviewModal';
import AddTimelineNodeModal from './AddTimelineNodeModal';
import { formatDate } from '../../../utils/dateUtils';
import { getExcerpt, getImageUrl } from '../../../utils/contentUtils';

const TimelineNode = ({ entry, side }: TimelineNodeProps) => {
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    let excerpt = getExcerpt(entry.content);
    if (entry.title && excerpt.toLowerCase().startsWith(entry.title.toLowerCase())) {
        excerpt = excerpt.substring(entry.title.length).trim();
    }

    const imageUrl = entry.cover_image || getImageUrl(entry.content);
    const dateStr = formatDate(entry.date || entry.created_at);

    return (
        <div className={`${styles.nodeWrapper} ${side === 'right' ? styles.right : styles.left}`}>
            <div className={styles.cardContainer}>
                <div
                    className={styles.card}
                    style={{ borderTop: entry.color ? `6px solid ${entry.color}` : undefined }}
                    onClick={() => setIsPreviewOpen(true)}
                >
                    <div className={styles.cardBody}>
                        <div className={styles.textContent}>
                            <h3 className={styles.title}>{entry.title || 'Untitled'}</h3>
                            {excerpt && <p className={styles.excerpt}>{excerpt}</p>}
                            <span className={styles.date}>{dateStr}</span>
                        </div>
                        {imageUrl && (
                            <div className={styles.imageWrapper}>
                                <img src={imageUrl} alt={entry.title} className={styles.image} />
                            </div>
                        )}
                    </div>

                    <button
                        className={styles.editBtn}
                        onClick={(e) => { e.stopPropagation(); setIsEditOpen(true); }}
                        aria-label="Edit node appearance"
                    >
                        <MoreHorizontal size={18} />
                    </button>
                </div>
            </div>

            <div className={styles.dot} />

            {isPreviewOpen && (
                <EntryPreviewModal entry={entry} onClose={() => setIsPreviewOpen(false)} />
            )}

            {isEditOpen && (
                <AddTimelineNodeModal entryToEdit={entry} onClose={() => setIsEditOpen(false)} />
            )}
        </div>
    );
};

export default TimelineNode;
