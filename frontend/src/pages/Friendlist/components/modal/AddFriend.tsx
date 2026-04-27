import ReactDOM from 'react-dom';
import { useState, useEffect, useCallback } from 'react';
import { X, Search, UserPlus, Check, Clock, Loader2 } from 'lucide-react';
import classNames from 'classnames';
import styles from './AddFriend.module.css';
import { type User as UserType, type ApiError } from '../../../../types';
import { searchUsers, sendRelationshipRequest } from '../../../../api';
import toast from 'react-hot-toast';
import { type AddConnectionProps } from '../../../../types';
import Avatar from '../../../../components/common/Avatar';
import { useUserProfile } from '../../../../contexts/UserProfileContext';
import FieldError from '../../../../components/common/FieldError';

const AddFriend: React.FC<AddConnectionProps> = ({ onClose, onRefresh }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<UserType[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isAdding, setIsAdding] = useState<number | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
    const { showProfile, isBlocked } = useUserProfile();

    const handleSearch = useCallback(async () => {
        setIsLoading(true);
        setFieldErrors({});
        try {
            const users = await searchUsers(query);
            setResults(users);
        } catch (error) {
            const err = error as ApiError;
            if (err.status === 422 && err.errors) {
                setFieldErrors(err.errors);
            } else {
                toast.error(err.message || 'Search failed');
            }
        } finally {
            setIsLoading(false);
        }
    }, [query]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (query.length >= 2) {
                handleSearch();
            } else {
                setResults([]);
                setFieldErrors({});
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query, handleSearch]);

    const handleSendRequest = async (userId: number) => {
        setIsAdding(userId);
        try {
            const res = await sendRelationshipRequest(userId);
            if (res?.message) toast.success(res.message);
            setResults((prev) => prev.map((u) => (u.id === userId ? { ...u, relationship_status: 'pending', is_requester: true } : u)));
            onRefresh();
            onClose();
        } catch (err: unknown) {
            const error = err as ApiError;
            toast.error(error.message || 'Failed to send request');
        } finally {
            setIsAdding(null);
        }
    };

    return ReactDOM.createPortal(
        <div className="global-modal-overlay" onClick={onClose}>
            <div className="global-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3 className={styles.title}>Find Friends</h3>
                    <button className="global-modal-close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.searchSection}>
                    <div
                        className={`${styles.searchBar} ${fieldErrors.query || fieldErrors.search || fieldErrors.friend_code ? 'input-error' : ''}`}
                    >
                        <Search size={20} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search by name or friend code..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <FieldError errors={fieldErrors.query || fieldErrors.search || fieldErrors.friend_code} />
                </div>

                <div className={styles.resultsList}>
                    {isLoading ? (
                        <div className="empty-state-placeholder">Searching...</div>
                    ) : results.length > 0 ? (
                        results.map((user) => (
                            <div
                                key={user.id}
                                className={classNames(styles.resultItem, {
                                    'user-blocked': isBlocked(user.id),
                                })}
                            >
                                <div className={styles.userInfoClickable} onClick={() => showProfile(user)}>
                                    <Avatar user={user} size={40} className={styles.avatar} />
                                    <div className={styles.userDetails}>
                                        <span className={styles.userName}>{user.name}</span>
                                        <span className={styles.userCode}>{user.friend_code}</span>
                                    </div>
                                </div>

                                <div className={styles.action}>
                                    {user.relationship_status === 'accepted' ? (
                                        <span className={styles.statusBadge}>
                                            <Check size={14} /> Friends
                                        </span>
                                    ) : user.relationship_status === 'pending' ? (
                                        <span className={classNames(styles.statusBadge, styles.statusBadgePending)}>
                                            <Clock size={14} /> Pending
                                        </span>
                                    ) : (
                                        <button
                                            className="btn btn-dark btn-sm"
                                            onClick={() => handleSendRequest(user.id)}
                                            disabled={isAdding === user.id}
                                        >
                                            {isAdding === user.id ? (
                                                <>
                                                    <Loader2 size={16} className="animate-spin" /> Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <UserPlus size={18} /> Add
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : query.length >= 2 ? (
                        <div className="empty-state-placeholder">No users found.</div>
                    ) : (
                        <div className="empty-state-placeholder">Enter at least 2 characters to search for users.</div>
                    )}
                </div>
            </div>
        </div>,
        document.getElementById('modal-root')!,
    );
};

export default AddFriend;
