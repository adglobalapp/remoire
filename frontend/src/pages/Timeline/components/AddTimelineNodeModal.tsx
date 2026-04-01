import { useState } from 'react';
import { uploadImage } from '../../../services/api';
import { useEntryContext } from '../../../contexts/EntryContext';
import { useTimelineContext } from '../../../contexts/TimelineContext';
import { createPortal } from 'react-dom';
import styles from './AddTimelineNodeModal.module.css';
import type { AddTimelineNodeModalProps } from '../../../types';
import { X, Upload, Palette } from 'lucide-react';

const COLORS = [
    { value: '#eab8b8', label: 'Dusty Rose' },
    { value: '#c7d5c8', label: 'Sage Green' },
    { value: '#d5c7b8', label: 'Sand' },
    { value: '#b8cdd5', label: 'Dusty Blue' },
    { value: '#d5b8c7', label: 'Mauve' },
    { value: '#c7b8d5', label: 'Lavender' },
    { value: '#795548', label: 'Brown' },
    { value: '#9e9e9e', label: 'Grey' },
];

const AddTimelineNodeModal = ({ onClose, entryToEdit }: AddTimelineNodeModalProps) => {
    const { entries, updateEntryMetadata } = useEntryContext();
    const { activeTimeline, addEntryToTimeline } = useTimelineContext();

    const [selectedEntryId, setSelectedEntryId] = useState<number | ''>(entryToEdit?.id || '');
    const [color, setColor] = useState<string>(entryToEdit?.color || '');
    const [coverImage, setCoverImage] = useState<string>(entryToEdit?.cover_image || '');
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    // Provide entries not currently in this timeline (unless it's default)
    const availableEntries = entries.filter(e => {
        if (!activeTimeline) return false;
        if (activeTimeline.isDefault) return true;
        return !activeTimeline.entryIds.includes(e.id);
    });

    // Handle initial entry selection to populate fields
    const handleEntrySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        const id = val === '' ? '' : Number(val);
        setSelectedEntryId(id);
        if (id !== '') {
            const entry = entries.find(ent => ent.id === id);
            if (entry) {
                setColor(entry.color || '');
                setCoverImage(entry.cover_image || '');
            }
        } else {
            setColor('');
            setCoverImage('');
        }
    };

    const handleSave = async () => {
        if (!selectedEntryId) return;
        setIsSaving(true);
        try {
            // First update the entry metadata
            await updateEntryMetadata(Number(selectedEntryId), {
                color: color || null,
                cover_image: coverImage || null,
            });

            // Then add it to the active timeline (if not editing an existing timeline node and not default)
            if (!entryToEdit && activeTimeline && !activeTimeline.isDefault) {
                addEntryToTimeline(activeTimeline.id, Number(selectedEntryId));
            }

            onClose();
        } catch (error) {
            console.error('Failed to add node', error);
        } finally {
            setIsSaving(false);
        }
    };

    return createPortal(
        <div
            className={styles.modalOverlay}
            onClick={onClose}
            onWheel={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
        >
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>{entryToEdit ? 'Edit Entry Appearance' : 'Add Entry to Timeline'}</h2>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
                        <X size={20} />
                    </button>
                </div>

                {!entryToEdit && (
                    <div className={styles.formGroup}>
                        <label>Select Entry</label>
                        <select
                            value={selectedEntryId}
                            onChange={handleEntrySelect}
                            className={styles.select}
                        >
                            <option value="">-- Choose an entry --</option>
                            {availableEntries.map(e => (
                                <option key={e.id} value={e.id}>
                                    {e.title || 'Untitled'} ({new Date(e.date || e.created_at).toLocaleDateString()})
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {Boolean(selectedEntryId) && (
                    <>
                        <div className={styles.formGroup}>
                            <label><Palette size={16} className={styles.iconInfo} /> Custom Color Stripe</label>
                            <div className={styles.colorPalette}>
                                {COLORS.map(c => (
                                    <button
                                        key={c.value}
                                        type="button"
                                        className={`${styles.colorBtn} ${color === c.value ? styles.colorBtnActive : ''}`}
                                        style={{ backgroundColor: c.value }}
                                        onClick={() => setColor(c.value === color ? '' : c.value)}
                                        title={c.label}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label><Upload size={16} className={styles.iconInfo} /> Cover Image</label>

                            {coverImage ? (
                                <div className={styles.imagePreviewContainer}>
                                    <img src={coverImage} alt="Cover" className={styles.previewThumbnail} />
                                    <button type="button" className="btn btn-secondary" onClick={() => setCoverImage('')}>Remove</button>
                                </div>
                            ) : (
                                <label className={`btn btn-secondary ${styles.uploadLabel}`}>
                                    <span>{isUploading ? 'Uploading...' : 'Choose Image...'}</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setIsUploading(true);
                                                setUploadError(null);
                                                const result = await uploadImage(file);
                                                if (result.url) {
                                                    setCoverImage(result.url);
                                                } else if (result.error) {
                                                    setUploadError(result.error);
                                                }
                                                setIsUploading(false);
                                            }
                                        }}
                                        className={styles.hiddenInput}
                                        disabled={isUploading}
                                    />
                                </label>
                            )}

                            {uploadError && <p className={styles.errorText}>{uploadError}</p>}
                            <p className={styles.helpText}>Leave empty to use main image from content automatically.</p>
                        </div>
                    </>
                )}

                <div className={styles.modalFooter}>
                    <button type="button" className={`btn btn-secondary`} onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        type="button"
                        className={`btn ${styles.saveBtn}`}
                        disabled={!selectedEntryId || isSaving || isUploading}
                        onClick={handleSave}
                    >
                        {isSaving ? 'Saving...' : (entryToEdit ? 'Save Changes' : 'Add to Timeline')}
                    </button>

                </div>
            </div>
        </div>,
        document.body
    );
};

export default AddTimelineNodeModal;
