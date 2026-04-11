import { useState, useEffect } from 'react';
import { X, Search, UserPlus, Check, Clock, AlertCircle } from 'lucide-react';
import classNames from 'classnames';
import styles from './AddFriend.module.css';
import { type User as UserType } from '../../../../types';
import { searchUsers, sendFriendRequest } from '../../../../api';
import toast from 'react-hot-toast';
import { type AddFriendProps } from '../../../../types';
import Avatar from '../../../../components/common/Avatar';

const AddFriend: React.FC<AddFriendProps> = ({ onClose, onRefresh }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<UserType[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

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
    }, [query]);

    const handleSearch = async () => {
        setIsLoading(true);
        setFieldErrors({});
        try {
            const users = await searchUsers(query);
            setResults(users);
        } catch (error: any) {
            if (error.status === 422 && error.errors) {
                setFieldErrors(error.errors);
            } else {
                toast.error(error.message || 'Search failed');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendRequest = async (userId: number) => {
        const success = await sendFriendRequest(userId);
        if (success) {
            toast.success('Friend request sent!');
            setResults(prev => prev.map(u =>
                u.id === userId ? { ...u, friend_status: 'pending', is_requester: true } : u
            ));
            onRefresh();
        } else {
            toast.error('Failed to send request');
        }
    };

    const renderFieldError = (fieldName: string) => {
        const errors = fieldErrors[fieldName];
        if (errors && errors.length > 0) {
            return (
                <div className="field-errors-container" style={{ padding: '0 12px' }}>
                    {errors.map((msg, idx) => (
                        <span key={idx} className="field-error-text">
                            <AlertCircle size={16} /> {msg}
                        </span>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="global-modal-overlay" onClick={onClose}>
            <div className="global-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3 className={styles.title}>Find Friends</h3>
                    <button className="global-modal-close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.searchSection}>
                    <div className={`${styles.searchBar} ${fieldErrors.query || fieldErrors.search || fieldErrors.friend_code ? 'input-error' : ''}`}>
                        <Search size={20} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search by name or friend code..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                        />
                    </div>
                    {renderFieldError('query') || renderFieldError('search') || renderFieldError('friend_code')}
                </div>

                <div className={styles.resultsList}>
                    {isLoading ? (
                        <div className="empty-state-placeholder">Searching...</div>
                    ) : results.length > 0 ? (
                        results.map(user => (
                            <div key={user.id} className={styles.resultItem}>
                                <div className={styles.userInfo}>
                                    <Avatar 
                                        user={user} 
                                        size={40}
                                        className={styles.avatar}
                                    />
                                    <div className={styles.userDetails}>
                                        <span className={styles.userName}>{user.name}</span>
                                        <span className={styles.userCode}>{user.friend_code}</span>
                                    </div>
                                </div>

                                <div className={styles.action}>
                                    {user.friend_status === 'accepted' ? (
                                        <span className={styles.statusBadge}><Check size={14} /> Friends</span>
                                    ) : user.friend_status === 'pending' ? (
                                        <span className={classNames(styles.statusBadge, styles.statusBadgePending)}><Clock size={14} /> Pending</span>
                                    ) : (
                                        <button
                                            className="btn btn-dark btn-sm"
                                            onClick={() => handleSendRequest(user.id)}
                                        >
                                            <UserPlus size={18} /> Add
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : query.length >= 2 ? (
                        <div className="empty-state-placeholder">No users found.</div>
                    ) : (
                        <div className="empty-state-placeholder">
                            Enter at least 2 characters to search for users.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddFriend;
