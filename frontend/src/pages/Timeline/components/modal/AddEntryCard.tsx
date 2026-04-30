import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload, Palette, Plus, Trash2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadImage } from '../../../../api';
import { useEntryContext } from '../../../../contexts/EntryContext';
import { useTimelineContext } from '../../../../contexts/TimelineContext';
import DeleteConfirmation from '../../../../components/common/DeleteConfirmation';
import FieldError from '../../../../components/common/FieldError';
import { type AddEntryCardProps, type ApiError } from '../../../../types';
import { PRESET_COLORS } from '../../../../utils/constants';
import styles from './AddEntryCard.module.css';

const AddEntryCard = ({ onClose, entryToEdit }: AddEntryCardProps) => {
    const { entries, updateEntry } = useEntryContext();
    const { activeTimeline, addEntryToTimeline, removeEntryFromTimeline } = useTimelineContext();

    const [selectedEntryId, setSelectedEntryId] = useState<number | ''>(entryToEdit?.id || '');
    const [color, setColor] = useState<string>(entryToEdit?.color || '');
    const [imageUrl, setImageUrl] = useState<string>(entryToEdit?.image_url || '');
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
    const [customColor, setCustomColor] = useState<string>(
        PRESET_COLORS.includes(entryToEdit?.color || '') ? '' : entryToEdit?.color || '',
    );
    const colorPickerRef = useRef<HTMLInputElement>(null);

    const availableEntries = entries.filter((e) => {
        if (!activeTimeline) return false;
        if (activeTimeline.isDefault) return true;
        return !activeTimeline.entryIds.includes(e.id);
    });

    const handleEntrySelect = (id: number) => {
        setSelectedEntryId(id);
        const entry = entries.find((ent) => ent.id === id);
        if (entry) {
            const entryColor = entry.color || '';
            const isPreset = PRESET_COLORS.includes(entryColor);
            setColor(isPreset ? entryColor : '');
            setCustomColor(isPreset ? '' : entryColor);
            setImageUrl(entry.image_url || '');
        }
        setFieldErrors({});
    };

    const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setCustomColor(val);
        setColor('');
        if (fieldErrors.color) {
            setFieldErrors((prev) => {
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
            const res = await updateEntry(Number(selectedEntryId), {
                color: handleColorSave(),
                image_url: imageUrl || null,
            });

            if (!entryToEdit && activeTimeline && !activeTimeline.isDefault) {
                await addEntryToTimeline(activeTimeline.id, Number(selectedEntryId));
            } else {
                if (res?.message) toast.success(res.message);
            }

            onClose();
        } catch (err: unknown) {
            const error = err as ApiError;
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

        setIsConfirming(true);
        try {
            await removeEntryFromTimeline(activeTimeline.id, entryToEdit.id);
            onClose();
        } catch (err: unknown) {
            const error = err as ApiError;
            toast.error(error.message || 'Failed to remove entry.');
        } finally {
            setIsConfirming(false);
            setIsConfirmOpen(false);
        }
    };

    return createPortal(
        <>
            <div
                className={styles.modalOverlay}
                onClick={onClose}
                onWheel={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
            >
                <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                    <div className={styles.modalHeader}>
                        <h2>{entryToEdit ? 'Edit Entry Card' : 'Add Entry to Timeline'}</h2>
                        <button className="modal-close-btn" onClick={onClose} aria-label="Close">
                            <X size={20} />
                        </button>
                    </div>

                    {!entryToEdit && (
                        <div className={styles.formGroup}>
                            <label htmlFor="entry-select">Select Entry</label>
                            <select
                                id="entry-select"
                                className={`${styles.selectInput} ${fieldErrors.entry_id ? 'input-error' : ''}`}
                                value={selectedEntryId}
                                onChange={(e) => handleEntrySelect(Number(e.target.value))}
                            >
                                <option value="" disabled>
                                    -- Choose an entry --
                                </option>
                                {availableEntries.map((e) => (
                                    <option key={e.id} value={e.id}>
                                        {e.title || 'Untitled'}
                                    </option>
                                ))}
                            </select>
                            <FieldError errors={fieldErrors.entry_id} />
                        </div>
                    )}

                    <div className={styles.formGroup}>
                        <label>
                            <Palette size={16} className={styles.iconInfo} /> Entry Accent Color
                        </label>
                        <div className={`${styles.colorPalette} ${fieldErrors.color ? 'input-error' : ''}`}>
                            {PRESET_COLORS.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    className={`${styles.colorBtn} ${color === c ? styles.colorBtnActive : ''}`}
                                    style={{ backgroundColor: c }}
                                    onClick={() => {
                                        setColor(c === color ? '' : c);
                                        setCustomColor('');
                                        setFieldErrors((prev) => {
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
                        <FieldError errors={fieldErrors.color} />
                    </div>

                    <div className={styles.formGroup}>
                        <label>
                            <Upload size={16} className={styles.iconInfo} /> Cover Image
                        </label>

                        {imageUrl ? (
                            <div className={styles.imagePreviewContainer}>
                                <img src={imageUrl} alt="Cover" className={styles.previewThumbnail} />
                                <button type="button" className="btn btn-secondary" onClick={() => setImageUrl('')}>
                                    Remove
                                </button>
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
                                            setFieldErrors((prev) => {
                                                const newErrors = { ...prev };
                                                delete newErrors.image_url;
                                                return newErrors;
                                            });
                                            const result = await uploadImage(file);
                                            if (result.url) {
                                                setImageUrl(result.url);
                                                toast.success(result.message || 'Image uploaded');
                                            } else if (result.error) {
                                                setUploadError(result.error);
                                                toast.error(`Upload error: ${result.error}`, { id: 'upload-error' });
                                            }
                                            setIsUploading(false);
                                        }
                                    }}
                                    className={styles.hiddenInput}
                                    disabled={isUploading}
                                />
                            </label>
                        )}

                        <FieldError errors={[...(uploadError ? [uploadError] : []), ...(fieldErrors.image_url || [])]} />
                        <p className={styles.helpText}>Leave empty to use main image from content automatically.</p>
                    </div>

                    <div className={styles.modalFooter}>
                        {entryToEdit && activeTimeline && (
                            <button
                                type="button"
                                className={`btn ${styles.deleteBtn}`}
                                onClick={() => setIsConfirmOpen(true)}
                                disabled={isLoading || isConfirming || isUploading || activeTimeline.isDefault}
                                title={activeTimeline.isDefault ? 'Cannot remove from default timeline' : undefined}
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
                            disabled={!selectedEntryId || isLoading || isConfirming || isUploading}
                            onClick={handleSave}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" /> Saving...
                                </>
                            ) : (
                                'Save'
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {isConfirmOpen && (
                <DeleteConfirmation
                    title="Remove from Timeline"
                    message={
                        <span>
                            Are you sure you want to remove <strong>{entryToEdit?.title || 'this entry'}</strong> from the timeline? It will
                            only be removed from this timeline and will not be permanently deleted.
                        </span>
                    }
                    confirmText="Remove"
                    isLoading={isConfirming}
                    loadingText="Removing..."
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setIsConfirmOpen(false)}
                />
            )}
        </>,
        document.getElementById('modal-root')!,
    );
};

export default AddEntryCard;
