import React from 'react';
import { Trash2, Check, Clock, X } from 'lucide-react';
import styles from '../../index.module.css';
import { formatDate } from '../../../../utils/dateUtils';
import { type RowProps } from '../../../../types';
import Avatar from '../../../../components/common/Avatar';

const Row: React.FC<RowProps> = ({ user, type, onAccept, onDelete, onViewProfile, index = 0 }) => {
    const lastSeenText = user.last_seen_at
        ? `Last seen: ${formatDate(user.last_seen_at)}`
        : `Joined: ${formatDate(user.created_at)}`;

    return (
        <div className={styles.friendRow} style={{ '--delay': index } as React.CSSProperties}>
            <div className={styles.friendMain}>
                <Avatar user={user} size={42} className={styles.avatar} />
                <div className={styles.info}>
                    <span className={styles.name} onClick={() => onViewProfile(user)}>
                        {user.name}
                    </span>
                    <span className={styles.subText}>{type === 'friend' ? lastSeenText : user.email}</span>
                </div>
            </div>

            <div className={styles.actions}>
                {type === 'pending' && (
                    <>
                        {onAccept && (
                            <button
                                className={`${styles.badgeButton} ${styles.badgeButtonSuccess}`}
                                onClick={() => onAccept(user.id)}
                                title="Accept Request"
                            >
                                <Check size={14} /> Accept
                            </button>
                        )}
                        <button
                            className={`${styles.badgeButton} ${styles.badgeButtonDanger}`}
                            onClick={() => onDelete(user.id)}
                            title="Reject Request"
                        >
                            <X size={14} /> Reject
                        </button>
                    </>
                )}

                {type === 'sent' && (
                    <>
                        <span title="Request Sent" className={styles.statusWrapper}>
                            <Clock size={18} color="var(--color-light-brown)" className={styles.statusIcon} />
                        </span>
                        <button
                            onClick={() => onDelete(user.id)}
                            className={styles.iconButton}
                            title="Cancel Request"
                        >
                            <Trash2 size={18} color="var(--color-error)" />
                        </button>
                    </>
                )}

                {type === 'friend' && (
                    <button
                        onClick={() => onDelete(user.id)}
                        className={styles.iconButton}
                        title="Remove Friend"
                    >
                        <Trash2 size={18} color="var(--color-error)" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default Row;
