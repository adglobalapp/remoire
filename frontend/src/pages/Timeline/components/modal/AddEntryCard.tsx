import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload, Palette, Plus, Trash2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadImage } from '../../../../api';
import { useEntryContext } from '../../../../contexts/EntryContext';
import { useTimelineContext } from '../../../../contexts/TimelineContext';
import DeleteConfirmation from '../../../../components/common/DeleteConfirmation';
import { type AddEntryCardProps, type ApiError } from '../../../../types';
import { PRESET_COLORS, themedColor } from '../../../../utils/constants';
import styles from './AddEntryCard.module.css';

const AddEntryCard = ({ onClose, entryToEdit }: AddEntryCardProps) => {
    const { entries, updateEntry } = useEntryContext();
    const { activeTimeline, addEntryToTimeline, removeEntryFromTimeline } = useTimelineContext();

    const [selectedEntryId, setSelectedEntryId] = useState<number | ''>(entryToEdit?.id || '');
    const [color, setColor] = useState<string>(entryToEdit?.color || '');
    const [imageUrl, setImageUrl] = useState<string>(entryToEdit?.image_url || '');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>(entryToEdit?.image_url || '');
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
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
        const entry = entries.find((e) => e.id === id);
        if (entry) {
            const entryColor = entry.color || '';
            const isPreset = PRESET_COLORS.includes(entryColor);
            setColor(isPreset ? entryColor : '');
            setCustomColor(isPreset ? '' : entryColor);
            setImageUrl(entry.image_url || '');
            setPreviewUrl(entry.image_url || '');
            setSelectedFile(null);
        }
    };

    const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCustomColor(e.target.value);
        setColor('');
    };

    const handleSave = async () => {
        if (!selectedEntryId) return;
        setIsLoading(true);
        try {
            let finalImageUrl = imageUrl;

            if (selectedFile) {
                setIsUploading(true);
                const uploadRes = await uploadImage(selectedFile);
                if (uploadRes.url) {
                    finalImageUrl = uploadRes.url;
                } else {
                    throw new Error(uploadRes.error || 'Upload failed');
                }
                setIsUploading(false);
            }

            const res = await updateEntry(Number(selectedEntryId), {
                color: color || customColor || null,
                image_url: finalImageUrl || null,
            });

            if (!entryToEdit && activeTimeline && !activeTimeline.isDefault) {
                await addEntryToTimeline(activeTimeline.id, Number(selectedEntryId));
            } else {
                if (res?.message) toast.success(res.message);
            }

            if (previewUrl && previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }

            onClose();
        } catch (err: unknown) {
            const error = err as ApiError;
            toast.error(error.message || 'Failed to save.');
        } finally {
            setIsLoading(false);
            setIsUploading(false);
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

                    <div className={styles.modalBody}>
                        {!entryToEdit && (
                            <div className={styles.formGroup}>
                                <label htmlFor="entry-select">Select Entry</label>
                                <select
                                    id="entry-select"
                                    className={styles.selectInput}
                                    value={selectedEntryId}
                                    onChange={(e) => handleEntrySelect(Number(e.target.value))}
                                >
                                    <option value="" disabled>
                                        Choose an entry
                                    </option>
                                    {availableEntries.map((e) => (
                                        <option key={e.id} value={e.id}>
                                            {e.title || 'Untitled'}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className={styles.formGroup}>
                            <label>
                                <Palette size={16} className={styles.iconInfo} /> Entry Accent Color
                            </label>
                            <div className={styles.colorPalette}>
                                {PRESET_COLORS.map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        className={`${styles.colorBtn} ${color === c ? styles.colorBtnActive : ''}`}
                                        style={{ backgroundColor: themedColor(c) }}
                                        onClick={() => {
                                            setColor(c === color ? '' : c);
                                            setCustomColor('');
                                        }}
                                    />
                                ))}

                                <button
                                    type="button"
                                    className={`${styles.colorBtn} ${styles.customColorBtn} ${customColor ? styles.colorBtnActive : ''}`}
                                    style={{ backgroundColor: customColor ? themedColor(customColor) : 'transparent' }}
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
                        </div>

                        <div className={styles.formGroup}>
                            <label>
                                <Upload size={16} className={styles.iconInfo} /> Cover Image
                            </label>

                            {previewUrl ? (
                                <div className={styles.imagePreviewContainer}>
                                    <img src={previewUrl} alt="Cover" className={styles.previewThumbnail} />
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            if (previewUrl.startsWith('blob:')) {
                                                URL.revokeObjectURL(previewUrl);
                                            }
                                            setPreviewUrl('');
                                            setImageUrl('');
                                            setSelectedFile(null);
                                        }}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <label className={`btn btn-secondary ${styles.uploadLabel}`}>
                                    <span>{isUploading ? 'Preparing...' : 'Choose Image...'}</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setSelectedFile(file);
                                                const localUrl = URL.createObjectURL(file);
                                                setPreviewUrl(localUrl);
                                            }
                                        }}
                                        className={styles.hiddenInput}
                                        disabled={isUploading}
                                    />
                                </label>
                            )}
                            <p className={styles.helpText}>Leave empty to use main image from content automatically.</p>
                        </div>
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
