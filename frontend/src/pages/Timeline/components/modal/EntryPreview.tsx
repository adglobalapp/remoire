import { useEntryContext } from '../../../../contexts/EntryContext';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useState, useRef, useLayoutEffect } from 'react';
import styles from './EntryPreview.module.css';
import editorStyles from '../../../Entry/components/editor/Canvas.module.css';
import UserProfile from '../../../Friendlist/components/modal/UserProfile';
import type { PageSettings, EntryPreviewProps, User } from '../../../../types';

import { X, Edit3, MapPin } from 'lucide-react';
import Avatar from '../../../../components/common/Avatar';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { ResizableImage } from '../../../Entry/components/editor/extensions/ResizableImage';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import { Color } from '@tiptap/extension-color';
import { FontSize } from '../../../Entry/components/editor/extensions/FontSize';
import { DEFAULT_PAGE_SETTINGS } from '../../../../types';

const EntryPreview = ({ entry, onClose }: EntryPreviewProps) => {
    const { selectEntry } = useEntryContext();
    const navigate = useNavigate();
    const [selectedParticipant, setSelectedParticipant] = useState<User | null>(null);

    const handleEdit = () => {
        selectEntry(entry);
        navigate('/entries');
        onClose();
    };

    let pageSettings: PageSettings = DEFAULT_PAGE_SETTINGS;
    let contentJSON = null;

    if (entry.content) {
        try {
            const parsed = typeof entry.content === 'string' ? JSON.parse(entry.content) : entry.content;
            if (parsed && typeof parsed === 'object') {
                if (parsed.contentJSON) {
                    contentJSON = parsed.contentJSON;
                    if (parsed.pageSettings) {
                        pageSettings = { ...DEFAULT_PAGE_SETTINGS, ...parsed.pageSettings };
                    }
                } else {
                    contentJSON = parsed;
                }
            } else {
                contentJSON = entry.content;
            }
        } catch {
            contentJSON = entry.content;
        }
    }

    const editor = useEditor({
        extensions: [
            StarterKit,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            ResizableImage,
            TextStyle,
            FontFamily.configure({ types: ['textStyle', 'heading', 'paragraph', 'listItem'] }),
            Color,
            FontSize,
        ],
        content: contentJSON,
        editable: false,
        immediatelyRender: false,
    });

    const [scale, setScale] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (!containerRef.current) return;

        const updateScale = () => {
            if (!containerRef.current) return;
            const containerWidth = containerRef.current.offsetWidth;
            // Reference width 210mm is approx 794px. We'll use 800 similar to the editor.
            const newScale = Math.min(1, containerWidth / 800);
            setScale(newScale);
        };

        updateScale();
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, []);

    return createPortal(
        <div
            className={styles.modalOverlay}
            onClick={onClose}
            onWheel={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
        >
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>Preview Entry</h2>
                    <button className="modal-close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.previewBody} ref={containerRef}>
                    <div
                        className={styles.previewCanvas}
                        style={{
                            transform: `scale(${scale})`,
                            height: `${297 * scale}mm`, // Approximate A4 aspect height to prevent overflow issues
                            minHeight: '100%'
                        }}
                    >
                        <div
                            className={styles.previewPaper}
                            style={{
                                backgroundImage: pageSettings.backgroundUrl ? `url(${pageSettings.backgroundUrl})` : undefined,
                                backgroundSize: pageSettings.backgroundUrl ? 'cover' : undefined,
                                padding: `${pageSettings.paddingTop}px ${pageSettings.paddingRight}px ${pageSettings.paddingBottom}px ${pageSettings.paddingLeft}px`
                            }}
                        >
                            <div className={editorStyles.editorContent}>
                                <EditorContent editor={editor} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.modalFooter}>
                    <div className={styles.footerInfo}>
                        {entry.location_name && (
                            <div className={styles.locationTag}>
                                <MapPin size={22} />
                                <span>{entry.location_name}</span>
                            </div>
                        )}

                        {entry.participants && entry.participants.length > 0 && (
                            <div className={styles.participantStack} title={entry.participants.map(p => p.name).join(', ')}>
                                {entry.participants.slice(0, 3).map((p, idx) => (
                                    <div 
                                        key={p.id} 
                                        className={styles.avatarMiniWrapper}
                                        style={{ zIndex: 10 - idx }}
                                        onClick={() => setSelectedParticipant(p)}
                                    >
                                        <Avatar user={p} size={34} />
                                    </div>
                                ))}
                                {entry.participants.length > 3 && (
                                    <Avatar
                                        text={`+${entry.participants.length - 3}`}
                                        size={34}
                                        backgroundColor="var(--color-dark-beige)"
                                        color="var(--color-burgundy)"
                                        className={styles.avatarMore}
                                    />
                                )}
                            </div>
                        )}
                    </div>

                    <div className={styles.footerActions}>
                        <button type="button" className={`btn btn-secondary`} onClick={onClose}>
                            Close
                        </button>
                        <button
                            type="button"
                            className={`btn ${styles.editEntryBtn}`}
                            onClick={handleEdit}
                        >
                            <Edit3 size={16} /> Edit Entry
                        </button>
                    </div>
                </div>
            </div>

            {selectedParticipant && (
                <UserProfile
                    user={selectedParticipant}
                    onClose={() => setSelectedParticipant(null)}
                    onBlock={() => { }}
                />
            )}
        </div>,
        document.body
    );
};

export default EntryPreview;
