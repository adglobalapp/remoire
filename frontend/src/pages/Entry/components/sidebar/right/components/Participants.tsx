import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Users, Plus, X, Loader2 } from 'lucide-react';
import { useEntryContext } from '../../../../../../contexts/EntryContext';
import styles from '../Right.module.css';
import AddParticipant from '../../../modal/AddParticipant';
import Avatar from '../../../../../../components/common/Avatar';
import { useUserProfile } from '../../../../../../contexts/UserProfileContext';
import { getRelationships } from '../../../../../../api';
import { type User, type ApiError } from '../../../../../../types';
import toast from 'react-hot-toast';
import classNames from 'classnames';

const Participants = () => {
    const { activeEntry, updateEntry } = useEntryContext();
    const { showProfile, isBlocked } = useUserProfile();
    const [friends, setFriends] = useState<User[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRemovingParticipant, setIsRemovingParticipant] = useState<number | null>(null);

    useEffect(() => {
        getRelationships().then(setFriends);
    }, []);

    const removeParticipant = async (userId: number) => {
        if (activeEntry) {
            setIsRemovingParticipant(userId);
            try {
                const currentIds = activeEntry.participants?.map((p) => p.id) || [];
                const res = await updateEntry(activeEntry.id, {
                    participant_ids: currentIds.filter((id) => id !== userId),
                });
                if (res?.message) toast.success(res.message);
            } catch (err: unknown) {
                const error = err as ApiError;
                toast.error(error.message || 'Failed to remove participant');
            } finally {
                setIsRemovingParticipant(null);
            }
        }
    };

    const addParticipant = async (userId: number) => {
        if (activeEntry) {
            const currentIds = activeEntry.participants?.map((p) => p.id) || [];
            if (!currentIds.includes(userId)) {
                try {
                    const res = await updateEntry(activeEntry.id, {
                        participant_ids: [...currentIds, userId],
                    });
                    if (res?.message) toast.success(res.message);
                } catch (err: unknown) {
                    const error = err as ApiError;
                    toast.error(error.message || 'Failed to add participant');
                }
            }
        }
    };

    const availableUsers = friends.filter((f) => !activeEntry?.participants?.some((p) => p.id === f.id));

    return (
        <div className={styles.metaGroup}>
            <div className={styles.infoLabelGroup}>
                <Users size={16} />
                <label>Participants</label>
            </div>

            <div className={styles.participantList}>
                {activeEntry?.participants && activeEntry.participants.length > 0 ? (
                    activeEntry.participants.map((user) => (
                        <div
                            key={`${activeEntry?.id || 'none'}-${user.id}`}
                            className={classNames(styles.participantRow, styles.rightSidebarAnimate, {
                                'user-blocked': isBlocked(user.id),
                            })}
                        >
                            <div className={styles.userItem} onClick={() => showProfile(user)}>
                                <Avatar user={user} size={32} className={styles.avatar} />
                                <span className={styles.userName}>{user.name}</span>
                            </div>
                            <button
                                className={styles.removeBtn}
                                onClick={() => removeParticipant(user.id)}
                                disabled={isRemovingParticipant === user.id}
                                title="Remove Participant"
                            >
                                {isRemovingParticipant === user.id ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="empty-state-placeholder">No participants yet</div>
                )}
            </div>

            <button className="btn btn-secondary btn-sm addParticipantBtn" onClick={() => setIsModalOpen(true)} disabled={!activeEntry}>
                <Plus size={14} /> Add Participant
            </button>

            {isModalOpen &&
                createPortal(
                    <AddParticipant users={availableUsers} onClose={() => setIsModalOpen(false)} onSelectUser={addParticipant} />,
                    document.body,
                )}
        </div>
    );
};

export default Participants;
