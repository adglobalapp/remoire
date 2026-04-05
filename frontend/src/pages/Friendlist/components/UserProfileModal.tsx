import { X, Calendar, Mail, User as UserIcon, Clock, UserX } from 'lucide-react';
import styles from './UserProfileModal.module.css';
import { formatDate, formatRelativeDate } from '../../../utils/dateUtils';
import { type UserProfileModalProps } from '../../../types';

const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, onClose, onBlock }) => {
    return (
        <div className="global-modal-overlay" onClick={onClose}>
            <div className="global-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="global-modal-close-btn" onClick={onClose}>
                    <X size={20} />
                </button>

                <div className={styles.profileHeader}>
                    <img
                        src={user.avatar_url || ''}
                        alt={user.name}
                        className={styles.profileAvatar}
                    />
                    <div className={styles.profileNameSection}>
                        <div className={styles.nameHeader}>
                            <h2>
                                {user.name}
                                <span className={styles.friendCodeBadge}>{user.friend_code}</span>
                            </h2>
                        </div>

                        {user.bio && (
                            <div className={styles.miniBio}>
                                {user.bio}
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.profileBody}>
                    <div className={styles.profileInfoGrid}>
                        <div className={styles.infoItem}>
                            <div className={styles.infoLabelGroup}>
                                <UserIcon size={16} />
                                <label>Username</label>
                            </div>
                            <div className={styles.infoContent}>
                                <span>{user.name}</span>
                            </div>
                        </div>
                        <div className={styles.infoItem}>
                            <div className={styles.infoLabelGroup}>
                                <Mail size={16} />
                                <label>Email Address</label>
                            </div>
                            <div className={styles.infoContent}>
                                <span>{user.email}</span>
                            </div>
                        </div>
                        <div className={styles.infoItem}>
                            <div className={styles.infoLabelGroup}>
                                <Calendar size={16} />
                                <label>Joined On</label>
                            </div>
                            <div className={styles.infoContent}>
                                <span>{formatDate(user.created_at)}</span>
                            </div>
                        </div>
                        <div className={styles.infoItem}>
                            <div className={styles.infoLabelGroup}>
                                <Clock size={16} />
                                <label>Last Active</label>
                            </div>
                            <div className={styles.infoContent}>
                                <span>{formatRelativeDate(user.last_seen_at)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.modalFooter}>
                    <button className="btn btn-danger" onClick={() => onBlock(user.id)}>
                        <UserX size={18} /> Block User
                    </button>
                    {user.friend_status === 'none' && (
                        <button className="btn btn-primary">
                            Send Friend Request
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfileModal;
