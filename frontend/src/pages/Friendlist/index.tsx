import { useState, useEffect, useCallback } from 'react';
import { UserPlus } from 'lucide-react';
import Loader from '../../components/common/Loader';
import Navbar from '../../components/common/Navbar';
import styles from './index.module.css';
import { type User as UserType, type ApiError } from '../../types';
import { getRelationships, getRelationshipRequests, acceptRelationshipRequest, deleteRelationship } from '../../api';
import List from './components/list/List';
import AddFriend from './components/modal/AddFriend';
import { useUserProfile } from '../../contexts/UserProfileContext';
import DeleteConfirmation from '../../components/common/DeleteConfirmation';
import toast from 'react-hot-toast';

const FriendlistPage = () => {
    const [friends, setFriends] = useState<UserType[]>([]);
    const [pendingRequests, setPendingRequests] = useState<UserType[]>([]);
    const [sentRequests, setSentRequests] = useState<UserType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [acceptingId, setAcceptingId] = useState<number | null>(null);
    const [directDeletingId, setDirectDeletingId] = useState<number | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const { showProfile, blockedUserIds, blockUser } = useUserProfile();

    const [confirmAction, setConfirmAction] = useState<{
        type: 'delete' | 'block';
        source?: 'friend' | 'sent' | 'pending';
        userId: number;
        userName: string;
    } | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [friendsData, requestsData] = await Promise.all([getRelationships(), getRelationshipRequests()]);
            setFriends(friendsData);
            setPendingRequests(requestsData.pending);
            setSentRequests(requestsData.sent);
        } catch (err: unknown) {
            const error = err as ApiError;
            toast.error(error.message || 'Failed to load friends');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const isBlocked = (id: number) => blockedUserIds.has(id);
    const visiblePending = pendingRequests.filter((u) => !isBlocked(u.id));
    const visibleSent = sentRequests.filter((u) => !isBlocked(u.id));
    const visibleFriends = friends.filter((u) => !isBlocked(u.id));

    const handleAccept = async (id: number) => {
        setAcceptingId(id);
        try {
            const res = await acceptRelationshipRequest(id);
            if (res?.message) toast.success(res.message);
            fetchData();
        } catch (err: unknown) {
            const error = err as ApiError;
            toast.error(error.message || 'Failed to accept request');
        } finally {
            setAcceptingId(null);
        }
    };

    const handleReject = async (id: number) => {
        setDirectDeletingId(id);
        try {
            const res = await deleteRelationship(id);
            if (res?.message) toast.success(res.message);
            fetchData();
        } catch (err: unknown) {
            const error = err as ApiError;
            toast.error(error.message || 'Failed to remove request');
        } finally {
            setDirectDeletingId(null);
        }
    };

    const handleConfirmAction = async () => {
        if (!confirmAction) return;
        setIsConfirming(true);
        if (confirmAction.type === 'delete') {
            try {
                const res = await deleteRelationship(confirmAction.userId);
                if (res?.message) toast.success(res.message);
                fetchData();
            } catch (err: unknown) {
                const error = err as ApiError;
                toast.error(error.message || 'Failed to complete action');
            }
        } else {
            await blockUser(confirmAction.userId);
            fetchData();
        }
        setIsConfirming(false);
        setConfirmAction(null);
    };

    const getModalContent = () => {
        if (!confirmAction) return null;
        if (confirmAction.type === 'block') {
            return {
                title: 'Block User?',
                message: (
                    <span>
                        Are you sure you want to block <strong>{confirmAction.userName}</strong>? They won't be able to search for you or
                        send requests.
                    </span>
                ),
                confirmText: 'Block User',
                loadingText: 'Blocking...',
            };
        }

        const isFriend = confirmAction.source === 'friend';
        return {
            title: isFriend ? 'Remove Friend?' : 'Remove Request?',
            message: (
                <span>
                    Are you sure you want to remove {isFriend ? '' : 'your friend request to '}
                    <strong>{confirmAction.userName}</strong>
                    {isFriend ? ' from your friends' : ''}?
                </span>
            ),
            confirmText: 'Remove',
            loadingText: 'Removing...',
        };
    };

    const modalContent = getModalContent();

    return (
        <div className="page-container">
            <Navbar />
            <main className={styles.mainContent}>
                {isLoading && friends.length === 0 && pendingRequests.length === 0 ? (
                    <Loader centered />
                ) : (
                    <div className={styles.container} data-reloading={isLoading ? '' : undefined}>
                        <header className={styles.header}>
                            <h1>Friends</h1>
                            <div className={styles.actionButtons}>
                                <button className="btn btn-dark" onClick={() => setShowAddModal(true)}>
                                    <UserPlus size={20} /> Add Friend
                                </button>
                            </div>
                        </header>

                        <List
                            title="Pending Requests"
                            users={visiblePending}
                            type="pending"
                            delay={0}
                            onAccept={handleAccept}
                            acceptingId={acceptingId}
                            deletingId={directDeletingId}
                            onDelete={(user) => handleReject(user.id)}
                            onViewProfile={showProfile}
                            titleClassName={styles.bgDarkBlue}
                        />

                        <List
                            title="Sent Requests"
                            users={visibleSent}
                            type="sent"
                            delay={1}
                            onDelete={(user) =>
                                setConfirmAction({
                                    type: 'delete',
                                    source: 'sent',
                                    userId: user.id,
                                    userName: user.name,
                                })
                            }
                            onViewProfile={showProfile}
                            titleClassName={styles.bgDarkBlue}
                        />

                        <List
                            title="My Friends"
                            users={visibleFriends}
                            type="friend"
                            delay={2}
                            onDelete={(user) =>
                                setConfirmAction({
                                    type: 'delete',
                                    source: 'friend',
                                    userId: user.id,
                                    userName: user.name,
                                })
                            }
                            onViewProfile={showProfile}
                            showEmptyState
                        />
                    </div>
                )}

                {showAddModal && <AddFriend onClose={() => setShowAddModal(false)} onRefresh={fetchData} />}

                {confirmAction && modalContent && (
                    <DeleteConfirmation
                        title={modalContent.title}
                        message={modalContent.message}
                        confirmText={modalContent.confirmText}
                        isLoading={isConfirming}
                        loadingText={modalContent.loadingText}
                        onConfirm={handleConfirmAction}
                        onCancel={() => setConfirmAction(null)}
                    />
                )}
            </main>
        </div>
    );
};

export default FriendlistPage;
