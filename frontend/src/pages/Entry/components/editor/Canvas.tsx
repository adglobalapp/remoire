import { useState, useRef, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import { Color } from '@tiptap/extension-color';
import classNames from 'classnames';
import Toolbar from './Toolbar';
import { ResizableImage } from './extensions/ResizableImage';
import { FontSize } from './extensions/FontSize';
import { useEntryContext } from '../../../../contexts/EntryContext';
import { CanvasScaleContext } from '../../../../contexts/CanvasScaleContext';
import { useCanvasNavigation } from '../../../../hooks/useCanvasNavigation';
import { type PageSettings, DEFAULT_PAGE_SETTINGS, type TiptapNode } from '../../../../types';
import { type Transaction } from '@tiptap/pm/state';
import styles from './Canvas.module.css';

const Canvas = () => {
    const { activeEntry, saveEntry } = useEntryContext();

    const { transform, setTransform, isDragging, containerRef, handleMouseDown, handleTouchStart } = useCanvasNavigation({
        minScale: 0.4,
        initialTransform: { x: 0, y: 0, scale: 1.15 },
    });

    const [isDragMode, setIsDragMode] = useState(false);
    const [isColorPicking, setIsColorPicking] = useState(false);
    const mouseDownTargetRef = useRef<EventTarget | null>(null);
    const [pageSettings, setPageSettings] = useState<PageSettings>(DEFAULT_PAGE_SETTINGS);
    const pageSettingsRef = useRef<PageSettings>(DEFAULT_PAGE_SETTINGS);

    const [initialEntryId] = useState<number | null>(activeEntry?.id ?? null);
    const loadedEntryIdRef = useRef<number | null>(null);
    const lastContentRef = useRef<string | null>(null);

    const parseStoredContent = (raw: string | null | undefined) => {
        if (!raw) return null;
        try {
            return JSON.parse(raw) as { contentJSON: TiptapNode; pageSettings?: PageSettings };
        } catch {
            return null;
        }
    };

    const getInitialContent = () => {
        if (!activeEntry) return '';
        const stored = parseStoredContent(activeEntry.content);
        return stored?.contentJSON ?? '<h1>Untitled</h1><p>Dear Diary...</p>';
    };

    const editor = useEditor({
        extensions: [
            StarterKit,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            ResizableImage,
            Placeholder.configure({ placeholder: 'Start writing...' }),
            TextStyle,
            FontFamily.configure({
                types: ['textStyle', 'heading', 'paragraph', 'listItem'],
            }),
            Color,
            FontSize,
        ],
        content: getInitialContent(),
        editable: !isDragMode,
        immediatelyRender: false,
        editorProps: {
            transformPastedHTML(html) {
                const doc = new DOMParser().parseFromString(html, 'text/html');
                doc.body.querySelectorAll('*').forEach((el) => {
                    if (el instanceof HTMLElement) {
                        el.style.fontFamily = '';
                    }
                });
                return doc.body.innerHTML;
            },
        },
    });

    const extractTitleFromJSON = (json: TiptapNode | null): string => {
        if (!json || !json.content) return 'Untitled';

        const findFirstText = (node: TiptapNode): string | null => {
            if (node.text) return node.text.trim();
            if (node.content && Array.isArray(node.content)) {
                for (const child of node.content) {
                    const found = findFirstText(child);
                    if (found) return found;
                }
            }
            return null;
        };

        return findFirstText(json) || 'Untitled';
    };

    const { updateEntry } = useEntryContext();
    useEffect(() => {
        if (!editor || initialEntryId === null) return;
        const handleUpdate = ({ transaction }: { transaction: Transaction }) => {
            if (transaction.getMeta('isColorPreview')) return;

            const contentJSON = editor.getJSON();
            const currentTitle = extractTitleFromJSON(contentJSON as TiptapNode);

            if (currentTitle !== activeEntry?.title) {
                updateEntry(initialEntryId, { title: currentTitle });
            }

            const serialized = JSON.stringify({
                contentJSON,
                pageSettings: pageSettingsRef.current,
            });
            saveEntry(initialEntryId, currentTitle, serialized);
        };
        editor.on('update', handleUpdate);
        return () => {
            editor.off('update', handleUpdate);
        };
    }, [editor, saveEntry, initialEntryId, activeEntry?.title, updateEntry]);

    useEffect(() => {
        if (!editor || !activeEntry || (loadedEntryIdRef.current === activeEntry.id && lastContentRef.current === activeEntry.content))
            return;

        const stored = parseStoredContent(activeEntry.content);
        const contentJSON = stored?.contentJSON ?? '<h1>Untitled</h1><p>Dear Diary...</p>';
        const settings = { ...DEFAULT_PAGE_SETTINGS, ...stored?.pageSettings };

        if (loadedEntryIdRef.current !== activeEntry.id) {
            loadedEntryIdRef.current = activeEntry.id;
            lastContentRef.current = activeEntry.content;

            setPageSettings(settings);
            pageSettingsRef.current = settings;
            editor.commands.setContent(contentJSON, { emitUpdate: false });
        } else {
            lastContentRef.current = activeEntry.content;
            if (JSON.stringify(settings) !== JSON.stringify(pageSettingsRef.current)) {
                setPageSettings(settings);
                pageSettingsRef.current = settings;
            }
        }
    }, [editor, activeEntry]);

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
        const isInteractive =
            target.tagName === 'IMG' ||
            !!target.closest('img') ||
            !!target.closest('.moveable-control-box') ||
            !!target.closest('[class*="imageBox"]') ||
            target.tagName === 'BUTTON' ||
            !!target.closest('button');
        const isMobile = window.innerWidth <= 800;

        if (isDragMode || isBackdrop || e.touches.length >= 2 || (isMobile && !isInteractive)) {
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
    }, [setTransform, containerRef]);

    const handlePageSettingsChange = (newSettings: PageSettings) => {
        setPageSettings(newSettings);
        pageSettingsRef.current = newSettings;
        if (initialEntryId !== null && editor) {
            const contentJSON = editor.getJSON();
            const currentTitle = extractTitleFromJSON(contentJSON);
            const serialized = JSON.stringify({
                contentJSON,
                pageSettings: newSettings,
            });
            saveEntry(initialEntryId, currentTitle, serialized);
        }
    };

    return (
        <>
            <div
                ref={containerRef}
                className={classNames(styles.editorContainer, {
                    [styles.isDragging]: isDragging,
                    [styles.dragMode]: isDragMode,
                    [styles.hideSelection]: isColorPicking,
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
                        style={{
                            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                        }}
                    >
                        {activeEntry && (
                            <div
                                className={styles.paper}
                                style={{
                                    backgroundImage: pageSettings.backgroundUrl ? `url(${pageSettings.backgroundUrl})` : undefined,
                                    backgroundSize: pageSettings.backgroundUrl ? 'cover' : undefined,
                                    padding: `${pageSettings.paddingTop}px ${pageSettings.paddingRight}px ${pageSettings.paddingBottom}px ${pageSettings.paddingLeft}px`,
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

            <Toolbar
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

export default Canvas;
