import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, Calendar, Plus, Users, PanelRight, X, Trash2, Pencil, Loader2 } from 'lucide-react';
import { useEntryContext } from '../../../../contexts/EntryContext';
import { useLocation } from 'react-router-dom';
import styles from './Right.module.css';
import { getRelationships } from '../../../../api';
import { type User, type LeftProps } from '../../../../types';
import AddParticipant from '../modal/AddParticipant';
import LocationPicker from '../modal/LocationPicker';
import Avatar from '../../../../components/common/Avatar';
import DeleteConfirmation from '../../../../components/common/DeleteConfirmation';
import { useUserProfile } from '../../../../contexts/UserProfileContext';
import toast from 'react-hot-toast';
import classNames from 'classnames';

const Right = ({ isOpen: propOpen, onToggle }: LeftProps) => {
    const { activeEntry, updateEntryDate, updateEntryParticipants, updateEntryMetadata } = useEntryContext();
    const { pathname } = useLocation();
    const lastPage = useRef(pathname);
    const [friends, setFriends] = useState<User[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [showLocationConfirm, setShowLocationConfirm] = useState(false);
    const [isRemovingLocation, setIsRemovingLocation] = useState(false);
    const [isRemovingParticipant, setIsRemovingParticipant] = useState<number | null>(null);
    const { showProfile, isBlocked } = useUserProfile();
    const mobileOpen = propOpen || false;
    const toggle = onToggle || (() => { });

    useEffect(() => {
        getRelationships().then(setFriends);
    }, []);

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
            toast.success('Date updated');
        }
    };

    const removeParticipant = async (userId: number) => {
        if (activeEntry) {
            setIsRemovingParticipant(userId);
            try {
                const currentIds = activeEntry.participants?.map(p => p.id) || [];
                await updateEntryParticipants(activeEntry.id, currentIds.filter(id => id !== userId));
                toast.success('Participant removed');
            } catch {
                toast.error('Failed to remove participant');
            } finally {
                setIsRemovingParticipant(null);
            }
        }
    };

    const addParticipant = async (userId: number) => {
        if (activeEntry) {
            const currentIds = activeEntry.participants?.map(p => p.id) || [];
            if (!currentIds.includes(userId)) {
                await updateEntryParticipants(activeEntry.id, [...currentIds, userId]);
                toast.success('Participant added');
            }
        }
    };

    const handleLocationSelect = async (location: { name: string, lat: number, lng: number }) => {
        if (activeEntry) {
            await updateEntryMetadata(activeEntry.id, {
                location_name: location.name,
                latitude: location.lat,
                longitude: location.lng
            });
            toast.success('Location updated');
        }
    };

    const handleRemoveLocation = async () => {
        if (activeEntry) {
            setIsRemovingLocation(true);
            try {
                await updateEntryMetadata(activeEntry.id, {
                    location_name: null as any,
                    latitude: null as any,
                    longitude: null as any
                });
                toast.success('Location removed');
            } catch {
                toast.error('Failed to remove location');
            } finally {
                setIsRemovingLocation(false);
                setShowLocationConfirm(false);
            }
        }
    };

    const dateValue = activeEntry?.date
        ? activeEntry.date.substring(0, 10)
        : '';

    const availableUsers = friends.filter(f =>
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
                            {activeEntry?.location_name ? (
                                <div className={styles.locationDisplay}>
                                    <span className={styles.locationName}>{activeEntry.location_name}</span>
                                    <div className={styles.locationActions}>
                                        <button
                                            className={styles.editLocationBtn}
                                            onClick={() => setIsLocationModalOpen(true)}
                                            title="Edit location"
                                        >
                                            <Pencil size={15} />
                                        </button>
                                        <button
                                            className={styles.removeLocationBtn}
                                            onClick={() => setShowLocationConfirm(true)}
                                            title="Remove location"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.emptyLocation}>
                                    <span className="empty-state-placeholder">No location set</span>
                                    <button
                                        className={`btn btn-secondary btn-sm ${styles.fullWidth}`}
                                        onClick={() => setIsLocationModalOpen(true)}
                                        disabled={!activeEntry}
                                    >
                                        <Plus size={14} /> Add Location
                                    </button>
                                </div>
                            )}
                        </div>
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
                                    <div key={user.id} className={classNames(styles.participantRow, { 'user-blocked': isBlocked(user.id) })}>
                                        <div className={styles.userItem} onClick={() => showProfile(user)}>
                                            <Avatar
                                                user={user}
                                                size={32}
                                                className={styles.avatar}
                                            />
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
                    users={availableUsers}
                    onClose={() => setIsModalOpen(false)}
                    onSelectUser={addParticipant}
                />,
                document.body
            )}

            {isLocationModalOpen && createPortal(
                <LocationPicker
                    onClose={() => setIsLocationModalOpen(false)}
                    onSelect={handleLocationSelect}
                    initialLocation={activeEntry?.latitude ? {
                        lat: activeEntry.latitude,
                        lng: activeEntry.longitude!,
                        name: activeEntry.location_name!
                    } : undefined}
                />,
                document.body
            )}

            {showLocationConfirm && (
                <DeleteConfirmation
                    title="Remove Location"
                    message="Are you sure you want to remove the location from this entry?"
                    confirmText="Remove"
                    cancelText="Cancel"
                    isLoading={isRemovingLocation}
                    loadingText="Removing..."
                    onConfirm={handleRemoveLocation}
                    onCancel={() => setShowLocationConfirm(false)}
                />
            )}
        </div>
    );
};

export default Right;