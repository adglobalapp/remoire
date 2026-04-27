import { useState } from 'react';
import { Loader2, UserMinus } from 'lucide-react';
import Avatar from '../../../components/common/Avatar';
import { useUserProfile } from '../../../contexts/UserProfileContext';
import styles from './Blocked.module.css';

const Blocked = () => {
    const { showProfile, blockedUsers, isLoadingBlocked, unblockUser } = useUserProfile();
    const [unblockingId, setUnblockingId] = useState<number | null>(null);

    const handleUnblock = async (id: number) => {
        setUnblockingId(id);
        await unblockUser(id);
        setUnblockingId(null);
    };

    return (
        <div className={styles.standaloneList}>
            <div className={styles.listHeader}>Blocked Users</div>
            <div className={styles.listContainer}>
                {isLoadingBlocked ? (
                    <div className={styles.loadingWrapper}>
                        <Loader2 className={`animate-spin ${styles.dimmed}`} size={32} />
                    </div>
                ) : blockedUsers.length === 0 ? (
                    <div className={`empty-state-placeholder ${styles.emptyPadded}`}>No blocked users.</div>
                ) : (
                    blockedUsers.map((u) => (
                        <div key={u.id} className={styles.listRow}>
                            <div className={`${styles.listUser} ${styles.clickable}`} onClick={() => showProfile(u)}>
                                <Avatar user={u} size={36} />
                                <span>{u.name}</span>
                            </div>
                            <button
                                onClick={() => handleUnblock(u.id)}
                                className={styles.badgeButton}
                                title="Unblock User"
                                disabled={unblockingId === u.id}
                            >
                                <UserMinus size={14} /> {unblockingId === u.id ? 'Unblocking...' : 'Unblock'}
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Blocked;
