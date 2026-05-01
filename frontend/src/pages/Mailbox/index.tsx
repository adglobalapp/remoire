import { useState, useEffect, useCallback } from 'react';
import Loader from '../../components/common/Loader';
import Navbar from '../../components/common/Navbar';
import styles from './index.module.css';
import { getNotifications, markAsRead, deleteNotification } from '../../api/notifications';
import { type Notification } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { type ApiError } from '../../types';
import toast from 'react-hot-toast';
import { Mail, MailOpen, Trash2, Eye } from 'lucide-react';
import DeleteConfirmation from '../../components/common/DeleteConfirmation';
import { formatDateTime } from '../../utils/dateUtils';

const MailboxPage = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { isAuthenticated } = useAuth();
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isConfirming, setIsConfirming] = useState(false);

    const fetchNotifications = useCallback(async () => {
        if (!isAuthenticated) return;

        setIsLoading(true);
        try {
            const data = await getNotifications();
            setNotifications(data);
        } catch (err: unknown) {
            const error = err as ApiError;
            if (error.status !== 401) {
                toast.error(error.message || 'Failed to fetch notifications');
            }
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleMarkAsRead = async (id: number) => {
        try {
            const res = await markAsRead(id);
            await fetchNotifications();
            if (res.message) toast.success(res.message);
        } catch (err: unknown) {
            const error = err as ApiError;
            toast.error(error.message || 'Failed to mark as read');
        }
    };

    const handleDeleteClick = (id: number) => {
        setDeletingId(id);
    };

    const handleConfirmDelete = async () => {
        if (!deletingId) return;
        setIsConfirming(true);
        try {
            const res = await deleteNotification(deletingId);
            await fetchNotifications();
            if (res.message) toast.success(res.message);
        } catch (err: unknown) {
            const error = err as ApiError;
            toast.error(error.message || 'Failed to delete notification');
        } finally {
            setIsConfirming(false);
            setDeletingId(null);
        }
    };

    const formatData = (notification: Notification) => {
        const { type, data } = notification;

        if (type === 'friend_request') {
            return `New friend request from ${data.requester_name || 'someone'}`;
        }

        if (type === 'anniversary') {
            const { entry_title, years } = data as { entry_title: string; years: number };
            return `Memory anniversary: "${entry_title}" happened ${years} year${years > 1 ? 's' : ''} ago!`;
        }

        return 'New notification';
    };

    return (
        <div className="page-container">
            <Navbar />
            <main className={styles.mainContent}>
                {isLoading && notifications.length === 0 ? (
                    <Loader centered />
                ) : (
                    <div className={styles.container}>
                        <header className={styles.header}>
                            <h1>Mailbox</h1>
                        </header>

                        <div className={styles.mailboxList}>
                            <div className={styles.sectionTitle}>Notifications</div>
                            {notifications.length === 0 ? (
                                <div className="empty-state-placeholder">Your mailbox is empty.</div>
                            ) : (
                                notifications.map((n) => (
                                    <div key={n.id} className={`${styles.notificationRow} ${!n.read_at ? styles.unread : ''}`}>
                                        <div className={styles.notifMain}>
                                            <div className={styles.notifIcon}>
                                                {!n.read_at ? <Mail size={18} /> : <MailOpen size={18} />}
                                            </div>
                                            <div className={styles.info}>
                                                <span className={styles.message}>{formatData(n)}</span>
                                                <span className={styles.date}>{formatDateTime(n.created_at)}</span>
                                            </div>
                                        </div>
                                        <div className={styles.actions}>
                                            {!n.read_at && (
                                                <button
                                                    className={styles.viewBtn}
                                                    onClick={() => handleMarkAsRead(n.id)}
                                                    title="Mark as read"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                            )}
                                            <button
                                                className="sidebar-delete-btn"
                                                onClick={() => handleDeleteClick(n.id)}
                                                title="Delete notification"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
                {deletingId && (
                    <DeleteConfirmation
                        title="Delete Notification?"
                        message="Are you sure you want to delete this notification? This action cannot be undone."
                        confirmText="Delete"
                        isLoading={isConfirming}
                        onConfirm={handleConfirmDelete}
                        onCancel={() => setDeletingId(null)}
                    />
                )}
            </main>
        </div>
    );
};

export default MailboxPage;
