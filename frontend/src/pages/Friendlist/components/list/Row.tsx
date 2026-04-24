import React from 'react';
import { Trash2, Check, Clock, X, Loader2 } from 'lucide-react';
import styles from '../../index.module.css';
import { formatDate } from '../../../../utils/dateUtils';
import { type RowProps } from '../../../../types';
import Avatar from '../../../../components/common/Avatar';
import { useUserProfile } from '../../../../contexts/UserProfileContext';
import classNames from 'classnames';

const Row: React.FC<RowProps> = ({ user, type, onAccept, onDelete, onViewProfile, index = 0, acceptingId, deletingId }) => {
    const { isBlocked } = useUserProfile();
    const lastSeenText = user.last_seen_at ? `Last seen: ${formatDate(user.last_seen_at)}` : `Joined: ${formatDate(user.created_at)}`;

    const isUserBlocked = isBlocked(user.id);
    const isAccepting = acceptingId === user.id;
    const isDeleting = deletingId === user.id;
    const isLoading = isAccepting || isDeleting;

    return (
        <div
            className={classNames(styles.friendRow, {
                'user-blocked': isUserBlocked,
            })}
            style={{ '--delay': index } as React.CSSProperties}
        >
            <div className={styles.friendMain} onClick={() => onViewProfile(user)}>
                <Avatar user={user} size={42} className={styles.avatar} />
                <div className={styles.info}>
                    <span className={styles.name}>{user.name}</span>
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
                                disabled={isLoading}
                            >
                                {isAccepting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}{' '}
                                {isAccepting ? 'Accepting...' : 'Accept'}
                            </button>
                        )}
                        <button
                            className={`${styles.badgeButton} ${styles.badgeButtonDanger}`}
                            onClick={() => onDelete(user.id)}
                            title="Reject Request"
                            disabled={isLoading}
                        >
                            {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}{' '}
                            {isDeleting ? 'Rejecting...' : 'Reject'}
                        </button>
                    </>
                )}

                {type === 'sent' && (
                    <>
                        <span title="Request Sent" className={styles.statusWrapper}>
                            <Clock size={18} color="var(--color-light-brown)" className={styles.statusIcon} />
                        </span>
                        <button onClick={() => onDelete(user.id)} className={styles.iconButton} title="Cancel Request" disabled={isLoading}>
                            {isDeleting ? (
                                <Loader2 size={18} color="var(--color-error)" className="animate-spin" />
                            ) : (
                                <Trash2 size={18} color="var(--color-error)" />
                            )}
                        </button>
                    </>
                )}

                {type === 'friend' && (
                    <button onClick={() => onDelete(user.id)} className={styles.iconButton} title="Remove Friend" disabled={isLoading}>
                        {isDeleting ? (
                            <Loader2 size={18} color="var(--color-error)" className="animate-spin" />
                        ) : (
                            <Trash2 size={18} color="var(--color-error)" />
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

export default Row;
