import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload, Palette, ChevronDown, Plus, Trash2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadImage } from '../../../../api';
import { useEntryContext } from '../../../../contexts/EntryContext';
import { useTimelineContext } from '../../../../contexts/TimelineContext';
import Confirmation from '../../../../components/common/modal/Confirmation';
import { type AddNodeProps } from '../../../../types';
import { PRESET_COLORS } from '../../../../utils/constants';
import styles from './AddNode.module.css';

const AddNode = ({ onClose, entryToEdit }: AddNodeProps) => {
    const { entries, updateEntryMetadata } = useEntryContext();
    const { activeTimeline, addEntryToTimeline, removeEntryFromTimeline } = useTimelineContext();

    const [selectedEntryId, setSelectedEntryId] = useState<number | ''>(entryToEdit?.id || '');
    const [color, setColor] = useState<string>(entryToEdit?.color || '');
    const [imageUrl, setImageUrl] = useState<string>(entryToEdit?.image_url || '');
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
    const [customColor, setCustomColor] = useState<string>(
        PRESET_COLORS.includes(entryToEdit?.color || '') ? '' : (entryToEdit?.color || '')
    );
    const dropdownRef = useRef<HTMLDivElement>(null);
    const colorPickerRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const availableEntries = entries.filter(e => {
        if (!activeTimeline) return false;
        if (activeTimeline.isDefault) return true;
        return !activeTimeline.entryIds.includes(e.id);
    });

    const selectedEntry = entries.find(e => e.id === selectedEntryId);

    const handleEntrySelect = (id: number) => {
        setSelectedEntryId(id);
        const entry = entries.find(ent => ent.id === id);
        if (entry) {
            const entryColor = entry.color || '';
            const isPreset = PRESET_COLORS.includes(entryColor);
            setColor(isPreset ? entryColor : '');
            setCustomColor(isPreset ? '' : entryColor);
            setImageUrl(entry.image_url || '');
        }
        setIsDropdownOpen(false);
        setFieldErrors({});
    };

    const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setCustomColor(val);
        setColor('');
        if (fieldErrors.color) {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.color;
                return newErrors;
            });
        }
    };

    const handleColorSave = () => {
        return color || customColor || null;
    };

    const handleSave = async () => {
        if (!selectedEntryId) return;
        setIsLoading(true);
        setFieldErrors({});
        try {
            await updateEntryMetadata(Number(selectedEntryId), {
                color: handleColorSave(),
                image_url: imageUrl || undefined,
            });

            if (!entryToEdit && activeTimeline && !activeTimeline.isDefault) {
                await addEntryToTimeline(activeTimeline.id, Number(selectedEntryId));
                toast.success('Entry added to timeline.');
            } else {
                toast.success(entryToEdit ? 'Changes saved.' : 'Entry appearance updated.');
            }

            onClose();
        } catch (error: any) {
            if (error.status === 422 && error.errors) {
                setFieldErrors(error.errors);
            } else {
                toast.error(error.message || 'Failed to save.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!entryToEdit || !activeTimeline || activeTimeline.isDefault) return;

        setIsDeleting(true);
        try {
            await removeEntryFromTimeline(activeTimeline.id, entryToEdit.id);
            toast.success('Entry removed from timeline.');
            onClose();
        } catch (error) {
            toast.error('Failed to remove entry.');
        } finally {
            setIsDeleting(false);
            setIsConfirmOpen(false);
        }
    };

    const renderFieldError = (fieldName: string) => {
        const errors = fieldErrors[fieldName];
        if (errors && errors.length > 0) {
            return (
                <div className="field-errors-container">
                    {errors.map((msg, idx) => (
                        <span key={idx} className="field-error-text">
                            <AlertCircle size={16} /> {msg}
                        </span>
                    ))}
                </div>
            );
        }
        return null;
    };

    return createPortal(
        <>
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
                                className={`${styles.selectTrigger} ${fieldErrors.entry_id ? 'input-error' : ''}`}
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
                            {renderFieldError('entry_id')}

                            {isDropdownOpen && (
                                <div className={styles.dropdownMenu}>
                                    {availableEntries.length === 0 ? (
                                        <p className="empty-state-placeholder">No more entries available.</p>
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
                        <label><Palette size={16} className={styles.iconInfo} /> Entry Accent Color</label>
                        <div className={`${styles.colorPalette} ${fieldErrors.color ? 'input-error' : ''}`}>
                            {PRESET_COLORS.map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    className={`${styles.colorBtn} ${color === c ? styles.colorBtnActive : ''}`}
                                    style={{ backgroundColor: c }}
                                    onClick={() => {
                                        setColor(c === color ? '' : c);
                                        setCustomColor('');
                                        setFieldErrors(prev => {
                                            const newErrors = { ...prev };
                                            delete newErrors.color;
                                            return newErrors;
                                        });
                                    }}
                                />
                            ))}

                            <button
                                type="button"
                                className={`${styles.colorBtn} ${styles.customColorBtn} ${customColor ? styles.colorBtnActive : ''}`}
                                style={{ backgroundColor: customColor || 'transparent' }}
                                onClick={() => colorPickerRef.current?.click()}
                                title="Custom Color"
                            >
                                {!customColor && <Plus size={16} />}
                                <input
                                    ref={colorPickerRef}
                                    type="color"
                                    value={customColor || '#742121'}
                                    onChange={handleCustomColorChange}
                                    className={styles.hiddenColorInput}
                                />
                            </button>
                        </div>
                        {renderFieldError('color')}
                    </div>

                    <div className={styles.formGroup}>
                        <label><Upload size={16} className={styles.iconInfo} /> Cover Image</label>

                        {imageUrl ? (
                            <div className={styles.imagePreviewContainer}>
                                <img src={imageUrl} alt="Cover" className={styles.previewThumbnail} />
                                <button type="button" className="btn btn-secondary" onClick={() => setImageUrl('')}>Remove</button>
                            </div>
                        ) : (
                            <label className={`btn btn-secondary ${styles.uploadLabel} ${fieldErrors.image_url ? 'input-error' : ''}`}>
                                <span>{isUploading ? 'Uploading...' : 'Choose Image...'}</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setIsUploading(true);
                                            setUploadError(null);
                                            setFieldErrors(prev => {
                                                const newErrors = { ...prev };
                                                delete newErrors.image_url;
                                                return newErrors;
                                            });
                                            const result = await uploadImage(file);
                                            if (result.url) {
                                                setImageUrl(result.url);
                                                toast.success('Image uploaded!');
                                            } else if (result.error) {
                                                setUploadError(result.error);
                                                toast.error(`Upload error: ${result.error}`);
                                            }
                                            setIsUploading(false);
                                        }
                                    }}
                                    className={styles.hiddenInput}
                                    disabled={isUploading}
                                />
                            </label>
                        )}

                        {renderFieldError('image_url')}
                        {uploadError && renderFieldError('image_url')}
                        <p className={styles.helpText}>Leave empty to use main image from content automatically.</p>
                    </div>

                    <div className={styles.modalFooter}>
                        {entryToEdit && activeTimeline && (
                            <button
                                type="button"
                                className={`btn ${styles.deleteBtn}`}
                                onClick={() => setIsConfirmOpen(true)}
                                disabled={isLoading || isDeleting || isUploading || activeTimeline.isDefault}
                                title={activeTimeline.isDefault ? "Cannot remove from default timeline" : undefined}
                            >
                                <Trash2 size={16} />
                                <span>Remove</span>
                            </button>
                        )}
                        <button type="button" className={`btn btn-secondary`} onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            type="button"
                            className={`btn ${styles.saveBtn}`}
                            disabled={!selectedEntryId || isLoading || isDeleting || isUploading}
                            onClick={handleSave}
                        >
                            {isLoading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </div>
            </div>

            {isConfirmOpen && (
                <Confirmation
                    title="Remove from Timeline"
                    variant="danger"
                    message={
                        <span>
                            Are you sure you want to remove <strong>{entryToEdit?.title || 'this entry'}</strong> from the timeline? It will only be removed from this timeline and will not be permanently deleted.
                        </span>
                    }
                    confirmText="Remove"
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setIsConfirmOpen(false)}
                />
            )}
        </>,
        document.body
    );
};

export default AddNode;
