import { useState, useEffect } from 'react';
import { UserPlus, Loader2 } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import styles from './index.module.css';
import { type User as UserType } from '../../types';
import { getFriends, getFriendRequests, acceptFriendRequest, deleteFriendship, blockUser } from '../../api';
import Row from './components/list/Row';
import AddFriend from './components/modal/AddFriend';
import UserProfile from './components/modal/UserProfile';
import Confirmation from '../../components/common/modal/Confirmation';
import toast from 'react-hot-toast';

const FriendlistPage = () => {
    const [friends, setFriends] = useState<UserType[]>([]);
    const [pendingRequests, setPendingRequests] = useState<UserType[]>([]);
    const [sentRequests, setSentRequests] = useState<UserType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserType | null>(null);

    // Confirmation Modal state
    const [confirmAction, setConfirmAction] = useState<{
        type: 'delete' | 'block';
        userId: number;
        userName: string;
    } | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [friendsData, requestsData] = await Promise.all([
                getFriends(),
                getFriendRequests()
            ]);
            setFriends(friendsData);
            setPendingRequests(requestsData.pending);
            setSentRequests(requestsData.sent);
        } catch (error) {
            toast.error('Failed to load friends');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAccept = async (id: number) => {
        const success = await acceptFriendRequest(id);
        if (success) {
            toast.success('Friend request accepted!');
            fetchData();
        } else {
            toast.error('Failed to accept request');
        }
    };

    const executeDelete = async (id: number) => {
        const success = await deleteFriendship(id);
        if (success) {
            toast.success('Connection removed');
            fetchData();
        } else {
            toast.error('Failed to remove connection');
        }
    };

    const executeBlock = async (id: number) => {
        const success = await blockUser(id);
        if (success) {
            toast.success('User blocked');
            fetchData();
        } else {
            toast.error('Failed to block user');
        }
    };

    const handleConfirmAction = () => {
        if (!confirmAction) return;
        if (confirmAction.type === 'delete') {
            executeDelete(confirmAction.userId);
        } else {
            executeBlock(confirmAction.userId);
        }
        setConfirmAction(null);
    };


    return (
        <div className="page-container">
            <Navbar />
            <main style={{ flex: 1, overflowY: 'auto' }}>
                <div className={styles.container}>
                    <header className={styles.header}>
                        <h1>Friends</h1>
                        <div className={styles.actionButtons}>
                            <button className="btn btn-dark" onClick={() => setShowAddModal(true)}>
                                <UserPlus size={20} /> Add Friend
                            </button>
                        </div>
                    </header>

                    {isLoading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                            <Loader2 className="loading-icon" size={48} />
                        </div>
                    ) : (
                        <>
                            {pendingRequests.length > 0 && (
                                <div className={styles.friendList} style={{ marginBottom: '30px' }}>
                                    <div className={`${styles.sectionTitle} ${styles.bgDarkBlue}`}>Pending Requests</div>
                                    {pendingRequests.map(user => (
                                        <Row
                                            key={user.id}
                                            user={user}
                                            type="pending"
                                            onAccept={handleAccept}
                                            onDelete={() => setConfirmAction({ type: 'delete', userId: user.id, userName: user.name })}
                                            onViewProfile={setSelectedUser}
                                        />
                                    ))}
                                </div>
                            )}

                            {sentRequests.length > 0 && (
                                <div className={styles.friendList} style={{ marginBottom: '30px' }}>
                                    <div className={`${styles.sectionTitle} ${styles.bgDarkBlue}`}>Sent Requests</div>
                                    {sentRequests.map(user => (
                                        <Row
                                            key={user.id}
                                            user={user}
                                            type="sent"
                                            onDelete={() => setConfirmAction({ type: 'delete', userId: user.id, userName: user.name })}
                                            onViewProfile={setSelectedUser}
                                        />
                                    ))}
                                </div>
                            )}

                            <div className={styles.friendList}>
                                <div className={styles.sectionTitle}>My Friends ({friends.length})</div>
                                {friends.length > 0 ? (
                                    friends.map(user => (
                                        <Row
                                            key={user.id}
                                            user={user}
                                            type="friend"
                                            onDelete={() => setConfirmAction({ type: 'delete', userId: user.id, userName: user.name })}
                                            onViewProfile={setSelectedUser}
                                        />
                                    ))
                                ) : (
                                    <div className="empty-state-placeholder">You haven't added any friends yet.</div>
                                )}
                            </div>
                        </>
                    )}

                    {showAddModal && (
                        <AddFriend
                            onClose={() => setShowAddModal(false)}
                            onRefresh={fetchData}
                        />
                    )}

                    {selectedUser && (
                        <UserProfile
                            user={selectedUser}
                            onClose={() => setSelectedUser(null)}
                            onBlock={(id) => setConfirmAction({ type: 'block', userId: id, userName: selectedUser.name })}
                        />
                    )}

                    {confirmAction && (
                        <Confirmation
                            title={confirmAction.type === 'delete' ? 'Remove Connection?' : 'Block User?'}
                            message={
                                confirmAction.type === 'delete'
                                    ? <span>Are you sure you want to remove <strong>{confirmAction.userName}</strong> from your friends?</span>
                                    : <span>Are you sure you want to block <strong>{confirmAction.userName}</strong>? They won't be able to search for you or send requests.</span>
                            }
                            confirmText={confirmAction.type === 'delete' ? 'Remove' : 'Block User'}
                            onConfirm={handleConfirmAction}
                            onCancel={() => setConfirmAction(null)}
                        />
                    )}
                </div>
            </main>
        </div>
    );
};

export default FriendlistPage;
