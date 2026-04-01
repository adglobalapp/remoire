import { useState, useRef, useEffect } from 'react';
import { uploadImage } from '../../../services/api';
import { useEntryContext } from '../../../contexts/EntryContext';
import { useTimelineContext } from '../../../contexts/TimelineContext';
import { createPortal } from 'react-dom';
import styles from './AddTimelineNodeModal.module.css';
import type { AddTimelineNodeModalProps } from '../../../types';
import { X, Upload, Palette, ChevronDown } from 'lucide-react';

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
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Provide entries not currently in this timeline (unless it's default)
    const availableEntries = entries.filter(e => {
        if (!activeTimeline) return false;
        if (activeTimeline.isDefault) return true;
        return !activeTimeline.entryIds.includes(e.id);
    });

    const selectedEntry = entries.find(e => e.id === selectedEntryId);

    // Handle initial entry selection to populate fields
    const handleEntrySelect = (id: number) => {
        setSelectedEntryId(id);
        const entry = entries.find(ent => ent.id === id);
        if (entry) {
            setColor(entry.color || '');
            setCoverImage(entry.cover_image || '');
        }
        setIsDropdownOpen(false);
    };

    const handleSave = async () => {
        if (!selectedEntryId) return;
        setIsSaving(true);
        try {
            await updateEntryMetadata(Number(selectedEntryId), {
                color: color || null,
                cover_image: coverImage || null,
            });

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
                    <button className="modal-close-btn" onClick={onClose} aria-label="Close">
                        <X size={20} />
                    </button>
                </div>

                {!entryToEdit && (
                    <div className={styles.formGroup} ref={dropdownRef}>
                        <label>Select Entry</label>
                        <div 
                            className={styles.selectTrigger} 
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        >
                            {selectedEntry ? (
                                <div className={styles.selectedEntryRow}>
                                    <span className={styles.selectedTitle}>{selectedEntry.title || 'Untitled'}</span>
                                    <span className={styles.selectedDate}>{new Date(selectedEntry.date || selectedEntry.created_at).toLocaleDateString('hu-HU')}</span>
                                </div>
                            ) : (
                                <span className={styles.placeholder}>-- Choose an entry --</span>
                            )}
                            <ChevronDown size={18} className={`${styles.chevron} ${isDropdownOpen ? styles.chevronOpen : ''}`} />
                        </div>

                        {isDropdownOpen && (
                            <div className={styles.dropdownMenu}>
                                {availableEntries.length === 0 ? (
                                    <p className={styles.emptyState}>No more entries available.</p>
                                ) : (
                                    availableEntries.map(e => (
                                        <div 
                                            key={e.id} 
                                            className={`${styles.entryListItem} ${selectedEntryId === e.id ? styles.entryListItemActive : ''}`}
                                            onClick={() => handleEntrySelect(e.id)}
                                        >
                                            <div className={styles.entryInfoLeft}>
                                                <span className={styles.entryTitle}>{e.title || 'Untitled'}</span>
                                            </div>
                                            <div className={styles.entryInfoRight}>
                                                <span className={styles.entryDate}>
                                                    {new Date(e.date || e.created_at).toLocaleDateString('hu-HU')}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                )}

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
