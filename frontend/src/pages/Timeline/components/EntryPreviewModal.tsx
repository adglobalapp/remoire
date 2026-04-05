import { usePage } from '../../../App';
import { useEntryContext } from '../../../contexts/EntryContext';
import { createPortal } from 'react-dom';
import styles from './EntryPreviewModal.module.css';
import editorStyles from '../../Entry/components/editor/Canvas.module.css';
import type { PageSettings, EntryPreviewModalProps } from '../../../types';

import { X, Edit3 } from 'lucide-react';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { ResizableImage } from '../../Entry/components/editor/extensions/ResizableImage';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import { Color } from '@tiptap/extension-color';
import { FontSize } from '../../Entry/components/editor/extensions/FontSize';
import { DEFAULT_PAGE_SETTINGS } from '../../../types';

const EntryPreviewModal = ({ entry, onClose }: EntryPreviewModalProps) => {
    const { selectEntry } = useEntryContext();
    const { setPage } = usePage();

    const handleEdit = () => {
        selectEntry(entry);
        setPage('entries');
        onClose();
    };

    let pageSettings: PageSettings = DEFAULT_PAGE_SETTINGS;
    let contentJSON = null;

    if (entry.content) {
        try {
            const parsed = typeof entry.content === 'string' ? JSON.parse(entry.content) : entry.content;
            if (parsed && typeof parsed === 'object') {
                contentJSON = parsed.contentJSON || parsed;
                if (parsed.pageSettings) {
                    pageSettings = { ...DEFAULT_PAGE_SETTINGS, ...parsed.pageSettings };
                }
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

                <div className={styles.previewBody}>
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

                <div className={styles.modalFooter}>
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
        </div>,
        document.body
    );
};

export default EntryPreviewModal;
