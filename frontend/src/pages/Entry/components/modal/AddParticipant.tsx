import { X, UserPlus, Loader2 } from 'lucide-react';
import { useState } from 'react';
import styles from './AddParticipant.module.css';
import { type AddParticipantProps } from '../../../../types';
import Avatar from '../../../../components/common/Avatar';
import { useUserProfile } from '../../../../contexts/UserProfileContext';
import classNames from 'classnames';

const AddParticipant: React.FC<AddParticipantProps> = ({ onClose, onSelectUser, users }) => {
    const { showProfile, isBlocked } = useUserProfile();
    const [isAdding, setIsAdding] = useState<number | null>(null);

    const handleSelect = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        setIsAdding(id);
        try {
            await onSelectUser(id);
            onClose();
        } finally {
            setIsAdding(null);
        }
    };

    return (
        <div className="global-modal-overlay" onClick={onClose}>
            <div className="global-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3 className={styles.title}>Add Participant</h3>
                    <button className="global-modal-close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.resultsList}>
                    {users.filter(f => !isBlocked(f.id)).length > 0 ? (
                        users.filter(f => !isBlocked(f.id)).map(friend => (
                            <div
                                key={friend.id}
                                className={classNames(styles.resultItem, { 'user-blocked': isBlocked(friend.id) })}
                                onClick={() => { onSelectUser(friend.id); onClose(); }}
                            >
                                <div 
                                    className={styles.userInfo} 
                                    onClick={(e) => { e.stopPropagation(); showProfile(friend); }}
                                >
                                    <Avatar 
                                        user={friend} 
                                        size={36} 
                                        className={styles.avatar} 
                                    />
                                    <div className={styles.userDetails}>
                                        <span className={styles.userName}>{friend.name}</span>
                                    </div>
                                </div>

                                <button
                                    className="btn btn-dark btn-sm"
                                    onClick={(e) => handleSelect(e, friend.id)}
                                    disabled={isAdding === friend.id}
                                >
                                    {isAdding === friend.id ? <><Loader2 size={16} className="animate-spin" /> Adding...</> : <><UserPlus size={16} /> Add</>}
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state-placeholder">
                            You have no friends to add as participants.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddParticipant;
