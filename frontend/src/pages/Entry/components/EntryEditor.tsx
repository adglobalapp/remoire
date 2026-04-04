import { useState, useRef, useEffect } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import { Color } from '@tiptap/extension-color';
import classNames from 'classnames';
import EditorToolbar from './EditorToolbar';
import { ResizableImage } from './extensions/ResizableImage';
import { FontSize } from './extensions/FontSize';
import { useEntryContext } from '../../../contexts/EntryContext';
import { CanvasScaleContext } from '../../../contexts/CanvasScaleContext';
import { useCanvasNavigation } from '../../../hooks/useCanvasNavigation';
import { type PageSettings, DEFAULT_PAGE_SETTINGS } from '../../../types';
import styles from './EntryEditor.module.css';

const EntryEditor = () => {
    const { activeEntry, saveEntry, updateEntryTitle } = useEntryContext();

    const {
        transform,
        setTransform,
        isDragging,
        containerRef,
        handleMouseDown,
        handleTouchStart,
    } = useCanvasNavigation({ minScale: 0.4, initialTransform: { x: 0, y: 0, scale: 1.15 } });

    const [isDragMode, setIsDragMode] = useState(false);
    const [isColorPicking, setIsColorPicking] = useState(false);
    const mouseDownTargetRef = useRef<EventTarget | null>(null);
    const [pageSettings, setPageSettings] = useState<PageSettings>(DEFAULT_PAGE_SETTINGS);
    const pageSettingsRef = useRef<PageSettings>(DEFAULT_PAGE_SETTINGS);

    const initialEntryId = useRef<number | null>(activeEntry?.id ?? null).current;
    const loadedEntryIdRef = useRef<number | null>(null);

    const parseStoredContent = (raw: string | null | undefined) => {
        if (!raw) return null;
        try {
            const parsed = JSON.parse(raw);
            return parsed;
        } catch {
            return raw;
        }
    };

    const getInitialContent = () => {
        if (!activeEntry) return '<h1 style="text-align: center">Untitled</h1><p>Dear Diary...</p>';
        const stored = parseStoredContent(activeEntry.content);
        if (stored && typeof stored === 'object' && stored.contentJSON) {
            return stored.contentJSON;
        }

        if (typeof stored === 'string' && stored) return stored;

        return '<h1 style="text-align: center">Untitled</h1><p>Dear Diary...</p>';
    };

    // Automatic title
    const extractTitle = (editor: Editor) => {
        const { doc } = editor.state;
        let title = '';

        // look for the first node that has text
        doc.descendants((node) => {
            if (title) return false;
            if (node.isTextblock && node.textContent.trim()) {
                title = node.textContent.trim();
                return false;
            }
        });

        return (title.length > 50 ? title.substring(0, 50) + '...' : title) || 'Untitled';
    };

    // Config editor
    const editor = useEditor({
        extensions: [
            StarterKit,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            ResizableImage,
            Placeholder.configure({ placeholder: 'Start writing...' }),
            TextStyle,
            FontFamily.configure({ types: ['textStyle', 'heading', 'paragraph', 'listItem'] }),
            Color,
            FontSize,
        ],
        content: getInitialContent(),
        editable: !isDragMode,
        immediatelyRender: false,
        editorProps: {
            transformPastedHTML(html) {
                const doc = new DOMParser().parseFromString(html, 'text/html');
                doc.body.querySelectorAll('*').forEach(el => {
                    if (el instanceof HTMLElement) {
                        el.style.fontFamily = '';
                    }
                });
                return doc.body.innerHTML;
            },
        },
    });

    // Save entry
    useEffect(() => {
        if (!editor || initialEntryId === null) return;
        const handleUpdate = ({ transaction }: { transaction: any }) => {
            if (transaction.getMeta('isColorPreview')) return;

            const titleText = extractTitle(editor);
            updateEntryTitle(initialEntryId, titleText);

            const contentJSON = editor.getJSON();
            const serialized = JSON.stringify({ contentJSON, pageSettings: pageSettingsRef.current });
            saveEntry(initialEntryId, titleText, serialized);
        };
        editor.on('update', handleUpdate);
        return () => { editor.off('update', handleUpdate); };
    }, [editor, saveEntry, updateEntryTitle, initialEntryId]);

    // Load entry
    useEffect(() => {
        if (!activeEntry || initialEntryId === null) return;
        if (loadedEntryIdRef.current === activeEntry.id) return;
        loadedEntryIdRef.current = activeEntry.id;

        const stored = parseStoredContent(activeEntry.content);
        const contentJSON = (stored && typeof stored === 'object' && stored.contentJSON)
            ? stored.contentJSON
            : (typeof stored === 'string' ? stored : '<h1>Untitled</h1><p>Dear Diary...</p>');

        let settings = DEFAULT_PAGE_SETTINGS;
        if (stored && typeof stored === 'object' && stored.pageSettings) {
            settings = { ...DEFAULT_PAGE_SETTINGS, ...stored.pageSettings };
        }

        // Delay content loading to avoid React life-cycle warnings (flushSync)
        setTimeout(() => {
            if (!editor) return;
            setPageSettings(settings);
            pageSettingsRef.current = settings;
            editor.commands.setContent(contentJSON, { emitUpdate: false });
            editor.commands.blur();
        }, 0);
    }, [activeEntry, editor, initialEntryId]);

    // Drag mode
    useEffect(() => {
        editor?.setEditable(!isDragMode);
        if (isDragMode) {
            editor?.commands.blur();
        }
    }, [isDragMode, editor]);

    const onMouseDown = (e: React.MouseEvent) => {
        const target = e.target as Element;
        mouseDownTargetRef.current = target;

        const isBackdrop = target === containerRef.current || target?.classList?.contains(styles.canvas);

        if (isBackdrop && !isDragMode) {
            e.preventDefault();
        }

        handleMouseDown(e, isDragMode);
    };

    const onTouchStart = (e: React.TouchEvent) => {
        const target = e.target as Element;
        const isBackdrop = target === containerRef.current || target?.classList?.contains(styles.canvas);

        if (isDragMode || isBackdrop || e.touches.length >= 2) {
            handleTouchStart(e, true);
        }
    };

    useEffect(() => {
        if (containerRef.current) {
            const width = containerRef.current.offsetWidth;
            const sidebarSpace = width > 1400 ? 660 : 32;
            const idealScale = (width - sidebarSpace) / 800;
            const initialScale = Math.min(1.0, idealScale);

            const initialX = (width / 2) * (1 - initialScale);
            setTransform({ x: initialX, y: 0, scale: initialScale });
        }
    }, [setTransform]);


    const handlePageSettingsChange = (newSettings: PageSettings) => {
        setPageSettings(newSettings);
        pageSettingsRef.current = newSettings;
        if (initialEntryId !== null && editor) {
            const titleText = extractTitle(editor);
            const contentJSON = editor.getJSON() || null;
            const serialized = JSON.stringify({ contentJSON, pageSettings: newSettings });
            saveEntry(initialEntryId, titleText, serialized);
        }
    };

    return (
        <>
            <div
                ref={containerRef}
                className={classNames(styles.editorContainer, {
                    [styles.isDragging]: isDragging,
                    [styles.dragMode]: isDragMode,
                    [styles.hideSelection]: isColorPicking
                })}
                onMouseDown={onMouseDown}
                onTouchStart={onTouchStart}

                onClick={(e) => {
                    const target = e.target as Element;
                    const startTarget = mouseDownTargetRef.current as Element;

                    const isBackdrop = (el: Element) => el === containerRef.current || el?.classList?.contains(styles.canvas);

                    if (isBackdrop(target) && isBackdrop(startTarget)) {
                        editor?.chain().setTextSelection(editor.state.selection.from).blur().run();
                    }
                }}
            >
                {!activeEntry && (
                    <div className={styles.emptyStateOverlay}>
                        <div className="empty-state-placeholder">
                            No entry selected. Please select one from the sidebar or click the + button.
                        </div>
                    </div>
                )}
                <CanvasScaleContext.Provider value={transform.scale}>
                    <div
                        className={styles.canvas}
                        style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})` }}
                    >
                        {activeEntry && (
                            <div
                                className={styles.paper}
                                style={{
                                    backgroundImage: pageSettings.backgroundUrl ? `url(${pageSettings.backgroundUrl})` : undefined,
                                    backgroundSize: pageSettings.backgroundUrl ? 'cover' : undefined,
                                    padding: `${pageSettings.paddingTop}px ${pageSettings.paddingRight}px ${pageSettings.paddingBottom}px ${pageSettings.paddingLeft}px`
                                }}
                                onClick={(e) => {
                                    if (e.target === e.currentTarget) {
                                        const selection = window.getSelection();
                                        if (!selection || selection.isCollapsed) {
                                            editor?.chain().focus('end').run();
                                        }
                                    }
                                }}
                            >
                                <div className={styles.editorContent}>
                                    <EditorContent editor={editor} />
                                </div>
                            </div>
                        )}
                    </div>
                </CanvasScaleContext.Provider>
            </div>

            <EditorToolbar
                editor={editor}
                isDragMode={isDragMode}
                onToggleDragMode={() => setIsDragMode(!isDragMode)}
                onColorPickerToggle={setIsColorPicking}
                pageSettings={pageSettings}
                onPageSettingsChange={handlePageSettingsChange}
            />
        </>
    );
};

export default EntryEditor;
