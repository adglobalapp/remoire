import React from 'react';
import { Trash2, Check, Clock } from 'lucide-react';
import styles from '../FriendlistPage.module.css';
import { formatDate } from '../../../utils/dateUtils';
import { type FriendRowProps } from '../../../types';

const FriendRow: React.FC<FriendRowProps> = ({ user, type, onAccept, onDelete, onViewProfile }) => {
    const lastSeenText = user.last_seen_at
        ? `Last seen: ${formatDate(user.last_seen_at)}`
        : `Joined: ${formatDate(user.created_at)}`;

    return (
        <div className={styles.friendRow}>
            <div className={styles.friendMain}>
                <img
                    src={user.avatar_url || ''}
                    alt={user.name}
                    className={styles.avatar}
                />
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
                                className="btn btn-success btn-sm"
                                onClick={() => onAccept(user.id)}
                                title="Accept Request"
                            >
                                <Check size={16} /> Accept
                            </button>
                        )}
                        <button
                            className="btn btn-danger btn-sm"
                            onClick={() => onDelete(user.id)}
                            title="Reject Request"
                        >
                            <Trash2 size={16} /> Reject
                        </button>
                    </>
                )}

                {type === 'sent' && (
                    <>
                        <span title="Request Sent" style={{ display: 'flex', alignItems: 'center' }}>
                            <Clock size={18} color="var(--color-light-brown)" style={{ marginRight: '4px' }} />
                        </span>
                        <button
                            onClick={() => onDelete(user.id)}
                            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            title="Cancel Request"
                        >
                            <Trash2 size={18} color="var(--color-error)" />
                        </button>
                    </>
                )}

                {type === 'friend' && (
                    <button
                        onClick={() => onDelete(user.id)}
                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        title="Remove Friend"
                    >
                        <Trash2 size={18} color="var(--color-error)" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default FriendRow;
