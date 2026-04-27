import { useState } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, Plus, Trash2, Pencil } from 'lucide-react';
import { useEntryContext } from '../../../../../../contexts/EntryContext';
import styles from '../Right.module.css';
import LocationPicker from '../../../modal/LocationPicker';
import DeleteConfirmation from '../../../../../../components/common/DeleteConfirmation';
import toast from 'react-hot-toast';
import { type ApiError } from '../../../../../../types';

const Location = () => {
    const { activeEntry, updateEntry } = useEntryContext();
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [showLocationConfirm, setShowLocationConfirm] = useState(false);
    const [isRemovingLocation, setIsRemovingLocation] = useState(false);

    const handleLocationSelect = async (location: { name: string; lat: number; lng: number }) => {
        if (activeEntry) {
            try {
                const res = await updateEntry(activeEntry.id, {
                    location_name: location.name,
                    latitude: location.lat,
                    longitude: location.lng,
                });
                if (res?.message) toast.success(res.message);
            } catch (err: unknown) {
                const error = err as ApiError;
                toast.error(error.message || 'Failed to update location');
            }
        }
    };

    const handleRemoveLocation = async () => {
        if (activeEntry) {
            setIsRemovingLocation(true);
            try {
                const res = await updateEntry(activeEntry.id, {
                    location_name: null,
                    latitude: null,
                    longitude: null,
                });
                if (res?.message) toast.success(res.message);
            } catch (err: unknown) {
                const error = err as ApiError;
                toast.error(error.message || 'Failed to remove location');
            } finally {
                setIsRemovingLocation(false);
                setShowLocationConfirm(false);
            }
        }
    };

    return (
        <div className={styles.metaGroup}>
            <div className={styles.infoLabelGroup}>
                <MapPin size={16} />
                <label>Location</label>
            </div>
            <div className={styles.metaValue}>
                {activeEntry?.location_name ? (
                    <div className={`${styles.locationDisplay} ${styles.rightSidebarAnimate}`} key={activeEntry.location_name}>
                        <span className={styles.locationName}>{activeEntry.location_name}</span>
                        <div className={styles.locationActions}>
                            <button className={styles.editLocationBtn} onClick={() => setIsLocationModalOpen(true)} title="Edit location">
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

            {isLocationModalOpen &&
                createPortal(
                    <LocationPicker
                        onClose={() => setIsLocationModalOpen(false)}
                        onSelect={handleLocationSelect}
                        initialLocation={
                            activeEntry?.latitude
                                ? {
                                      lat: activeEntry.latitude,
                                      lng: activeEntry.longitude!,
                                      name: activeEntry.location_name!,
                                  }
                                : undefined
                        }
                    />,
                    document.body,
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

export default Location;
