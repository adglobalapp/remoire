import React, { useState } from 'react';
import { X, Calendar, Mail, User as UserIcon, Clock, UserX, UserMinus } from 'lucide-react';
import styles from './UserProfile.module.css';
import { formatDate, formatRelativeDate } from '../../../../utils/dateUtils';
import { type UserProfileProps } from '../../../../types';
import Avatar from '../../../../components/common/Avatar';
import { useAuth } from '../../../../contexts/AuthContext';
import DeleteConfirmation from '../../../../components/common/DeleteConfirmation';
import { useUserProfile } from '../../../../contexts/UserProfileContext';

const UserProfile: React.FC<UserProfileProps> = ({ user, onClose }) => {
    const { user: authUser } = useAuth();
    const { blockUser, unblockUser } = useUserProfile();
    const [showBlockConfirm, setShowBlockConfirm] = useState(false);
    const [isUnblocking, setIsUnblocking] = useState(false);
    const [isBlocking, setIsBlocking] = useState(false);

    const isSelf = authUser?.id === user.id;
    const relationshipStatus = user.relationship_status || 'none';

    const handleBlockClick = () => {
        setShowBlockConfirm(true);
    };

    const executeBlock = async () => {
        setIsBlocking(true);
        const success = await blockUser(user.id);
        setIsBlocking(false);
        if (success) {
            onClose();
        }
        setShowBlockConfirm(false);
    };

    const handleUnblockClick = async () => {
        setIsUnblocking(true);
        const success = await unblockUser(user.id);
        if (success) {
            onClose();
        }
        setIsUnblocking(false);
    };

    return (
        <div className="global-modal-overlay" onClick={onClose}>
            <div className="global-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="global-modal-close-btn" onClick={onClose}>
                    <X size={20} />
                </button>

                <div className={styles.profileHeader}>
                    <Avatar user={user} size={80} className={styles.profileAvatar} />
                    <div className={styles.profileNameSection}>
                        <div className={styles.nameHeader}>
                            <h2>
                                {user.name}
                                <span className={styles.friendCodeBadge}>{user.friend_code}</span>
                            </h2>
                        </div>

                        {user.bio && <div className={styles.miniBio}>{user.bio}</div>}
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

                {!isSelf && (
                    <div className={styles.modalFooter}>
                        {relationshipStatus === 'blocked' ? (
                            <button className="btn btn-secondary" onClick={handleUnblockClick} disabled={isUnblocking}>
                                <UserMinus size={18} /> {isUnblocking ? 'Unblocking...' : 'Unblock User'}
                            </button>
                        ) : (
                            <>
                                <button className="btn btn-danger" onClick={handleBlockClick}>
                                    <UserX size={18} /> Block User
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>

            {showBlockConfirm && (
                <DeleteConfirmation
                    title="Block User?"
                    message={
                        <span>
                            Are you sure you want to block <strong>{user.name}</strong>? They won't be able to search for you or send
                            requests.
                        </span>
                    }
                    confirmText="Block User"
                    isLoading={isBlocking}
                    loadingText="Blocking..."
                    onConfirm={executeBlock}
                    onCancel={() => setShowBlockConfirm(false)}
                />
            )}
        </div>
    );
};

export default UserProfile;
