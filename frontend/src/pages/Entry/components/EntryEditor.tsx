import { useEditor, EditorContent, Editor } from '@tiptap/react';
import { useState, useRef, useCallback, useEffect } from 'react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { ResizableImage } from './extensions/ResizableImage';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import { Color } from '@tiptap/extension-color';
import { FontSize } from './extensions/FontSize';
import EditorToolbar from './EditorToolbar';
import styles from './EntryEditor.module.css';
import classNames from 'classnames';
import { useEntryContext } from '../../../contexts/EntryContext';
import { type PageSettings, DEFAULT_PAGE_SETTINGS } from '../../../types';

const EntryEditor = () => {
    const { activeEntry, saveEntry, updateEntryTitle } = useEntryContext();

    const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
    const [isDragging, setIsDragging] = useState(false);
    const [isDragMode, setIsDragMode] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
    const [activeEditor, setActiveEditor] = useState<Editor | null>(null);
    const [isColorPicking, setIsColorPicking] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
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
        // Fallback for legacy data or simple strings
        if (typeof stored === 'string' && stored) return stored;

        // New entry or empty
        return '<h1 style="text-align: center">Untitled</h1><p>Dear Diary...</p>';
    };

    const extractTitle = (editor: Editor) => {
        const { doc } = editor.state;
        let title = '';

        // Look for the first node that has text
        doc.descendants((node) => {
            if (title) return false;
            if (node.isTextblock && node.textContent.trim()) {
                title = node.textContent.trim();
                return false;
            }
        });

        return (title.length > 50 ? title.substring(0, 50) + '...' : title) || 'Untitled';
    };

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
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
        onCreate: ({ editor }) => {
            setActiveEditor(editor);
        },
        onFocus: ({ editor }) => setActiveEditor(editor),
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

        queueMicrotask(() => {
            setPageSettings(settings);
        });
        pageSettingsRef.current = settings;

        if (editor) {
            editor.commands.setContent(contentJSON, { emitUpdate: false });
            setTimeout(() => {
                editor.commands.blur();
            }, 10);
        }
    }, [activeEntry, editor, initialEntryId]);

    useEffect(() => {
        editor?.setEditable(!isDragMode);
        if (isDragMode) {
            editor?.commands.blur();
        }
    }, [isDragMode, editor]);

    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        const container = containerRef.current;
        if (!container) return;

        if (e.ctrlKey) {
            const rect = container.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            const sensitivity = 0.001;
            const delta = e.deltaY * sensitivity;

            setTransform(prev => {
                const nextScale = Math.min(2, Math.max(0.4, prev.scale - delta));
                if (nextScale === prev.scale) return prev;
                const nextX = mouseX - (mouseX - prev.x) * nextScale / prev.scale;
                const nextY = mouseY - (mouseY - prev.y) * nextScale / prev.scale;
                return { x: nextX, y: nextY, scale: nextScale };
            });
        } else {
            setTransform(prev => ({
                ...prev,
                x: prev.x - e.deltaX,
                y: prev.y - e.deltaY
            }));
        }
    }, []);

    const handleMouseDown = (e: React.MouseEvent) => {
        const target = e.target as Element;
        mouseDownTargetRef.current = target;

        const isBackdrop = target === containerRef.current || target?.classList?.contains(styles.canvas);

        if (isBackdrop && !isDragMode) {
            e.preventDefault();
        }

        if (e.button === 0 && isDragMode) {
            setIsDragging(true);
            setLastMousePos({ x: e.clientX, y: e.clientY });
        }
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isDragging) {
            const dx = e.clientX - lastMousePos.x;
            const dy = e.clientY - lastMousePos.y;
            setTransform(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
            setLastMousePos({ x: e.clientX, y: e.clientY });
        }
    }, [isDragging, lastMousePos]);

    const handleMouseUp = useCallback(() => setIsDragging(false), []);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const onWheel = (e: WheelEvent) => e.preventDefault();
        container.addEventListener('wheel', onWheel, { passive: false });
        const width = container.offsetWidth;
        const initialScale = 1.15;
        const initialX = (width / 2) * (1 - initialScale);
        setTransform({ x: initialX, y: 0, scale: initialScale });
        return () => container.removeEventListener('wheel', onWheel);
    }, []);

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
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onClick={(e) => {
                    const target = e.target as Element;
                    const startTarget = mouseDownTargetRef.current as Element;

                    const isBackdrop = (el: Element) => el === containerRef.current || el?.classList?.contains(styles.canvas);

                    if (isBackdrop(target) && isBackdrop(startTarget)) {
                        editor?.chain().setTextSelection(editor.state.selection.from).blur().run();
                    }
                }}
            >
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
            </div>

            <EditorToolbar
                editor={activeEditor}
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
