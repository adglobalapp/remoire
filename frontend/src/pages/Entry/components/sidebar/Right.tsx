import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, Calendar, Plus, Users, PanelRight, X, Trash2 } from 'lucide-react';
import { useEntryContext } from '../../../../contexts/EntryContext';
import { useLocation } from 'react-router-dom';
import styles from './Right.module.css';
import { getFriends } from '../../../../api';
import { type User, type LeftProps } from '../../../../types';
import AddParticipant from '../modal/AddParticipant';
import Avatar from '../../../../components/common/Avatar';

const Right = ({ isOpen: propOpen, onToggle }: LeftProps) => {
    const { activeEntry, updateEntryDate, updateEntryParticipants } = useEntryContext();
    const { pathname } = useLocation();
    const lastPage = useRef(pathname);
    const [friends, setFriends] = useState<User[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const mobileOpen = propOpen || false;
    const toggle = onToggle || (() => { });

    // Load friends for participant selection
    useEffect(() => {
        getFriends().then(setFriends);
    }, []);

    // Auto-close on page change (only on mobile/tablet)
    useEffect(() => {
        const isLargeScreen = window.innerWidth > 1400;
        if (isLargeScreen) return;

        if (pathname !== lastPage.current) {
            if (onToggle && propOpen) {
                onToggle();
            }
        }
        lastPage.current = pathname;
    }, [pathname, onToggle, propOpen]);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (activeEntry) {
            updateEntryDate(activeEntry.id, e.target.value);
        }
    };

    const removeParticipant = (userId: number) => {
        if (activeEntry) {
            const currentIds = activeEntry.participants?.map(p => p.id) || [];
            updateEntryParticipants(activeEntry.id, currentIds.filter(id => id !== userId));
        }
    };

    const addParticipant = (userId: number) => {
        if (activeEntry) {
            const currentIds = activeEntry.participants?.map(p => p.id) || [];
            if (!currentIds.includes(userId)) {
                updateEntryParticipants(activeEntry.id, [...currentIds, userId]);
            }
            setIsModalOpen(false);
        }
    };

    // Format stored date (YYYY-MM-DD) for the date input
    const dateValue = activeEntry?.date
        ? activeEntry.date.substring(0, 10)
        : '';

    const availableFriends = friends.filter(f => 
        !activeEntry?.participants?.some(p => p.id === f.id)
    );

    return (
        <div className={mobileOpen ? styles.mobileVisible : styles.mobileHidden}>
            <button
                className={`sidebar-toggle-fab ${styles.mobileToggle}`}
                onClick={toggle}
                aria-label={mobileOpen ? 'Close sidebar' : 'Open sidebar'}
            >
                {<PanelRight size={20} />}
            </button>

            <aside className="sidebar-container sidebar-burgundy">
                <div className="sidebar-header">
                    <h3>Entry Details</h3>
                    <button className="sidebar-close-btn" onClick={toggle} aria-label="Close sidebar">
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.scrollContent}>
                    <div className={styles.metaGroup}>
                        <div className={styles.infoLabelGroup}>
                            <MapPin size={16} />
                            <label>Location</label>
                        </div>
                        <div className={styles.metaValue}>
                            <span className="empty-state-placeholder">No location set</span>
                        </div>
                        <button className={`btn btn-secondary btn-sm ${styles.fullWidth}`}>
                            <Plus size={14} /> Add Location
                        </button>
                    </div>

                    <div className={styles.metaGroup}>
                        <div className={styles.infoLabelGroup}>
                            <Calendar size={16} />
                            <label>Date</label>
                        </div>
                        <div className={styles.metaValue}>
                            <input
                                type="date"
                                value={dateValue}
                                onChange={handleDateChange}
                                onClick={(e) => 'showPicker' in e.target && (e.target as HTMLInputElement).showPicker()}
                                className={styles.dateInput}
                                disabled={!activeEntry}
                            />
                        </div>
                    </div>

                    <div className={styles.metaGroup}>
                        <div className={styles.infoLabelGroup}>
                            <Users size={16} />
                            <label>Participants</label>
                        </div>
                        
                        <div className={styles.participantList}>
                            {activeEntry?.participants && activeEntry.participants.length > 0 ? (
                                activeEntry.participants.map(user => (
                                    <div key={user.id} className={styles.participantRow}>
                                        <div className={styles.userItem}>
                                            <Avatar user={user} size={32} className={styles.avatar} />
                                            <span className={styles.userName}>{user.name}</span>
                                        </div>
                                        <button 
                                            className={styles.removeBtn}
                                            onClick={() => removeParticipant(user.id)}
                                            title="Remove Participant"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state-placeholder">
                                    No participants yet
                                </div>
                            )}
                        </div>

                        <button 
                            className="btn btn-secondary btn-sm addParticipantBtn" 
                            onClick={() => setIsModalOpen(true)}
                            disabled={!activeEntry}
                        >
                            <Plus size={14} /> Add Participant
                        </button>
                    </div>
                </div>
            </aside>

            {isModalOpen && createPortal(
                <AddParticipant 
                    friends={availableFriends} 
                    onClose={() => setIsModalOpen(false)} 
                    onSelectFriend={addParticipant} 
                />,
                document.body
            )}
        </div>
    );
};

export default Right;