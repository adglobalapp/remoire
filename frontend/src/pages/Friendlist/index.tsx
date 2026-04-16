import { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import Loader from '../../components/common/Loader';
import Navbar from '../../components/common/Navbar';
import styles from './index.module.css';
import { type User as UserType } from '../../types';
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
    const [showAddModal, setShowAddModal] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const { showProfile, blockedUserIds, blockUser } = useUserProfile();

    const [confirmAction, setConfirmAction] = useState<{
        type: 'delete' | 'block';
        userId: number;
        userName: string;
    } | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [friendsData, requestsData] = await Promise.all([
                getRelationships(),
                getRelationshipRequests()
            ]);
            setFriends(friendsData);
            setPendingRequests(requestsData.pending);
            setSentRequests(requestsData.sent);
        } catch {
            toast.error('Failed to load friends');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const isBlocked = (id: number) => blockedUserIds.has(id);
    const visiblePending = pendingRequests.filter(u => !isBlocked(u.id));
    const visibleSent = sentRequests.filter(u => !isBlocked(u.id));
    const visibleFriends = friends.filter(u => !isBlocked(u.id));

    const handleAccept = async (id: number) => {
        const success = await acceptRelationshipRequest(id);
        if (success) {
            toast.success('Friend request accepted!');
            fetchData();
        } else {
            toast.error('Failed to accept request');
        }
    };

    const handleConfirmAction = async () => {
        if (!confirmAction) return;
        setIsConfirming(true);
        if (confirmAction.type === 'delete') {
            const success = await deleteRelationship(confirmAction.userId);
            if (success) { toast.success('Connection removed'); fetchData(); }
            else toast.error('Failed to remove connection');
        } else {
            await blockUser(confirmAction.userId);
            fetchData();
        }
        setIsConfirming(false);
        setConfirmAction(null);
    };

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
                            onDelete={(user) => setConfirmAction({ type: 'delete', userId: user.id, userName: user.name })}
                            onViewProfile={showProfile}
                            titleClassName={styles.bgDarkBlue}
                        />

                        <List
                            title="Sent Requests"
                            users={visibleSent}
                            type="sent"
                            delay={1}
                            onDelete={(user) => setConfirmAction({ type: 'delete', userId: user.id, userName: user.name })}
                            onViewProfile={showProfile}
                            titleClassName={styles.bgDarkBlue}
                        />

                        <List
                            title="My Friends"
                            users={visibleFriends}
                            type="friend"
                            delay={2}
                            onDelete={(user) => setConfirmAction({ type: 'delete', userId: user.id, userName: user.name })}
                            onViewProfile={showProfile}
                            showEmptyState
                        />
                    </div>
                )}

                {showAddModal && (
                    <AddFriend onClose={() => setShowAddModal(false)} onRefresh={fetchData} />
                )}

                {confirmAction && (
                    <DeleteConfirmation
                        title={confirmAction.type === 'delete' ? 'Remove Friend?' : 'Block User?'}
                        message={
                            confirmAction.type === 'delete'
                                ? <span>Are you sure you want to remove <strong>{confirmAction.userName}</strong> from your friends?</span>
                                : <span>Are you sure you want to block <strong>{confirmAction.userName}</strong>? They won't be able to search for you or send requests.</span>
                        }
                        confirmText={confirmAction.type === 'delete' ? 'Remove' : 'Block User'}
                        isLoading={isConfirming}
                        loadingText={confirmAction.type === 'delete' ? 'Removing...' : 'Blocking...'}
                        onConfirm={handleConfirmAction}
                        onCancel={() => setConfirmAction(null)}
                    />
                )}
            </main>
        </div>
    );
};

export default FriendlistPage;
