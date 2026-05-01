import { useState } from 'react';
import { type EntryCardProps } from '../../../../types';
import styles from './EntryCard.module.css';
import { Settings } from 'lucide-react';
import EntryPreview from '../modal/EntryPreview';
import AddEntryCard from '../modal/AddEntryCard';
import { formatDate } from '../../../../utils/dateUtils';
import { getExcerpt, getImageUrl } from '../../../../utils/contentUtils';
import Avatar from '../../../../components/common/Avatar';

const EntryCard = ({ entry, side, idx = 0 }: EntryCardProps) => {
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    let excerpt = getExcerpt(entry.content);
    if (entry.title && excerpt.toLowerCase().startsWith(entry.title.toLowerCase())) {
        excerpt = excerpt.substring(entry.title.length).trim();
    }

    const imageUrl = entry.image_url || getImageUrl(entry.content);
    const dateStr = formatDate(entry.date || entry.created_at);

    return (
        <div
            className={`${styles.nodeWrapper} ${side === 'right' ? styles.right : styles.left}`}
            style={{ animationDelay: `${0.3 + idx * 0.15}s` }}
        >
            <div className={styles.cardContainer}>
                <div
                    className={styles.card}
                    style={{
                        borderTop: entry.color ? `6px solid ${entry.color}` : undefined,
                    }}
                    onClick={() => setIsPreviewOpen(true)}
                >
                    <div className={styles.cardBody}>
                        <div className={styles.textContent}>
                            <h3 className={styles.title}>{entry.title || 'Untitled'}</h3>
                            {excerpt && <p className={styles.excerpt}>{excerpt}</p>}
                            <div className={styles.cardFooter}>
                                <span className={styles.date}>{dateStr}</span>
                                {entry.participants && entry.participants.length > 0 && (
                                    <div className={styles.participantAvatars}>
                                        {entry.participants.length > 4 && (
                                            <Avatar
                                                text={`+${entry.participants.length - 4}`}
                                                size={24}
                                                className={styles.participantAvatar}
                                                backgroundColor="var(--color-dark-beige)"
                                                title={entry.participants
                                                    .slice(4)
                                                    .map((p) => p.name)
                                                    .join(', ')}
                                            />
                                        )}
                                        {entry.participants
                                            .slice(0, 4)
                                            .reverse()
                                            .map((p) => (
                                                <Avatar key={p.id} user={p} size={24} className={styles.participantAvatar} />
                                            ))}
                                    </div>
                                )}
                            </div>
                            <button
                                className={styles.editBtn}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsEditOpen(true);
                                }}
                                aria-label="Edit node appearance"
                            >
                                <Settings size={18} />
                            </button>
                        </div>
                        {imageUrl && (
                            <div className={styles.imageWrapper}>
                                <img src={imageUrl} alt={entry.title} className={styles.image} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className={styles.dot} />

            {isPreviewOpen && <EntryPreview entry={entry} onClose={() => setIsPreviewOpen(false)} />}

            {isEditOpen && <AddEntryCard entryToEdit={entry} onClose={() => setIsEditOpen(false)} />}
        </div>
    );
};

export default EntryCard;
