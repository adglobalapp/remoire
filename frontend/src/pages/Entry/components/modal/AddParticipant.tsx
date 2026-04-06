import { X, UserPlus } from 'lucide-react';
import styles from './AddParticipant.module.css';
import { type AddParticipantProps } from '../../../../types';

const AddParticipant: React.FC<AddParticipantProps> = ({ onClose, onSelectFriend, friends }) => {
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
                    {friends.length > 0 ? (
                        friends.map(friend => (
                            <div
                                key={friend.id}
                                className={styles.resultItem}
                                onClick={() => onSelectFriend(friend.id)}
                            >
                                <div className={styles.userInfo}>
                                    {friend.avatar_url ? (
                                        <img
                                            src={friend.avatar_url}
                                            alt={friend.name}
                                            className={styles.avatar}
                                        />
                                    ) : (
                                        <div className={styles.avatar}>{friend.name.charAt(0)}</div>
                                    )}
                                    <div className={styles.userDetails}>
                                        <span className={styles.userName}>{friend.name}</span>
                                    </div>
                                </div>

                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={(e) => { e.stopPropagation(); onSelectFriend(friend.id); }}
                                >
                                    <UserPlus size={18} /> Add
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
