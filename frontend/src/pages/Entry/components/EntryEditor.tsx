import { useEditor, EditorContent, Editor, Extension } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Document from '@tiptap/extension-document';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { ResizableImage } from './extensions/ResizableImage';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import { Color } from '@tiptap/extension-color';
import { FontSize } from './extensions/FontSize';
import { Plugin } from '@tiptap/pm/state';
import { useState, useRef, useCallback, useEffect } from 'react';
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

    const getInitialTitle = () => {
        if (!activeEntry) return '<h1>Untitled</h1>';
        const stored = parseStoredContent(activeEntry.content);
        if (stored && typeof stored === 'object' && stored.titleHTML) {
            return stored.titleHTML;
        }
        return `<h1>${activeEntry.title || 'Untitled'}</h1>`;
    };

    const getInitialContent = () => {
        if (!activeEntry) return '';
        const stored = parseStoredContent(activeEntry.content);
        if (stored && typeof stored === 'object' && stored.contentJSON) {
            return stored.contentJSON;
        }
        return '';
    };

    const contentEditor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            ResizableImage,
            Placeholder.configure({ placeholder: 'Dear Diary...' }),
            TextStyle,
            FontFamily.configure({ types: ['textStyle'] }),
            Color,
            FontSize,
        ],
        content: getInitialContent(),
        editable: !isDragMode,
        onCreate: ({ editor }) => {
            const stored = activeEntry ? parseStoredContent(activeEntry.content) : null;
            if (!stored || (typeof stored === 'object' && !stored.contentJSON)) {
                editor.chain().focus().setFontFamily("'Kaushan Script', cursive").run();
            }
            setActiveEditor(editor);
        },
        onFocus: ({ editor }) => setActiveEditor(editor),
    });

    const titleEditor = useEditor({
        extensions: [
            StarterKit.configure({
                document: false,
            }),
            Document.extend({
                content: 'heading',
            }),
            Underline,
            TextStyle,
            FontFamily.configure({ types: ['textStyle'] }),
            FontSize,
            Color,
            Placeholder.configure({ placeholder: 'Entry Title' }),
            Extension.create({
                name: 'singleLine',
                addKeyboardShortcuts() {
                    return {
                        Enter: () => true,
                    };
                },
                addProseMirrorPlugins() {
                    return [
                        new Plugin({
                            props: {
                                handleKeyDown: (_, event) => {
                                    if (event.key === 'Enter') {
                                        return true;
                                    }
                                },
                                handlePaste: (view, event) => {
                                    const text = event.clipboardData?.getData('text/plain') ?? '';
                                    if (text.includes('\n') || text.includes('\r')) {
                                        const cleanText = text.replace(/[\n\r]+/g, ' ');
                                        const { tr } = view.state;
                                        tr.insertText(cleanText);
                                        view.dispatch(tr);
                                        return true;
                                    }
                                    return false;
                                },
                            },
                        }),
                    ];
                },
            }),
        ],
        content: getInitialTitle(),
        editable: !isDragMode,
        onCreate: ({ editor }) => setActiveEditor(editor),
        onFocus: ({ editor }) => setActiveEditor(editor),
    });

    useEffect(() => {
        if (!contentEditor || initialEntryId === null) return;
        const handleUpdate = () => {
            const titleHTML = titleEditor?.getHTML() ?? `<h1>${activeEntry?.title || 'Untitled'}</h1>`;
            const titleText = titleEditor?.getText() || 'Untitled';
            const contentJSON = contentEditor.getJSON();
            const serialized = JSON.stringify({ titleHTML, contentJSON, pageSettings: pageSettingsRef.current });
            saveEntry(initialEntryId, titleText, serialized);
        };
        contentEditor.on('update', handleUpdate);
        return () => { contentEditor.off('update', handleUpdate); };
    }, [contentEditor, titleEditor, saveEntry, initialEntryId]);

    useEffect(() => {
        if (!titleEditor || initialEntryId === null) return;
        const handleUpdate = () => {
            const titleText = titleEditor.getText() || 'Untitled';
            updateEntryTitle(initialEntryId, titleText);
            const titleHTML = titleEditor.getHTML();
            const contentJSON = contentEditor?.getJSON() ?? null;
            const serialized = JSON.stringify({ titleHTML, contentJSON, pageSettings: pageSettingsRef.current });
            saveEntry(initialEntryId, titleText, serialized);
        };
        titleEditor.on('update', handleUpdate);
        return () => { titleEditor.off('update', handleUpdate); };
    }, [titleEditor, contentEditor, saveEntry, updateEntryTitle, initialEntryId]);

    useEffect(() => {
        if (!activeEntry || initialEntryId === null) return;
        if (loadedEntryIdRef.current === activeEntry.id) return;
        loadedEntryIdRef.current = activeEntry.id;

        const stored = parseStoredContent(activeEntry.content);
        const titleHTML = (stored && typeof stored === 'object' && stored.titleHTML)
            ? stored.titleHTML
            : `<h1>${activeEntry.title || 'Untitled'}</h1>`;
        const contentJSON = (stored && typeof stored === 'object' && stored.contentJSON)
            ? stored.contentJSON
            : null;

        let settings = DEFAULT_PAGE_SETTINGS;
        if (stored && typeof stored === 'object' && stored.pageSettings) {
            settings = { ...DEFAULT_PAGE_SETTINGS, ...stored.pageSettings };
        }

        queueMicrotask(() => {
            setPageSettings(settings);
        });
        pageSettingsRef.current = settings;

        const hasSavedTitle = stored && typeof stored === 'object' && stored.titleHTML;

        titleEditor?.commands.setContent(titleHTML);

        if (!hasSavedTitle && titleEditor) {
            setTimeout(() => {
                titleEditor.chain()
                    .selectAll()
                    .setFontFamily("'Kaushan Script', cursive")
                    .setFontSize('36px')
                    .setTextSelection(0)
                    .run();
            }, 0);
        }

        if (contentJSON) {
            contentEditor?.commands.setContent(contentJSON);
        } else {
            contentEditor?.commands.setContent('');
            contentEditor?.chain().focus().setFontFamily("'Kaushan Script', cursive").run();
        }
    }, [activeEntry, titleEditor, contentEditor, initialEntryId]);



    useEffect(() => {
        contentEditor?.setEditable(!isDragMode);
        titleEditor?.setEditable(!isDragMode);

        if (isDragMode) {
            contentEditor?.commands.blur();
            titleEditor?.commands.blur();
        }
    }, [isDragMode, contentEditor, titleEditor]);

    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.preventDefault();
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const delta = e.deltaY;
        const zoomStep = 0.1;
        setTransform(prev => {
            const nextScale = delta > 0 ? Math.max(0.4, prev.scale - zoomStep) : Math.min(2, prev.scale + zoomStep);
            if (nextScale === prev.scale) return prev;
            const nextX = mouseX - (mouseX - prev.x) * nextScale / prev.scale;
            const nextY = mouseY - (mouseY - prev.y) * nextScale / prev.scale;
            return { x: nextX, y: nextY, scale: nextScale };
        });
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
        if (initialEntryId !== null) {
            const titleHTML = titleEditor?.getHTML() || '';
            const titleText = titleEditor?.getText() || 'Untitled';
            const contentJSON = contentEditor?.getJSON() || null;
            const serialized = JSON.stringify({ titleHTML, contentJSON, pageSettings: newSettings });
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
                        contentEditor?.chain().setTextSelection(contentEditor.state.selection.from).blur().run();
                        titleEditor?.chain().setTextSelection(titleEditor.state.selection.from).blur().run();
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
                                        contentEditor?.chain().focus('end').run();
                                    }
                                }
                            }}
                        >
                            <div className={styles.titleInput} onClick={(e) => e.stopPropagation()}>
                                <EditorContent editor={titleEditor} />
                            </div>
                            <div className={styles.editorContent}>
                                <EditorContent editor={contentEditor} />
                            </div>
                        </div>
                    )}

                </div>
            </div>

            <EditorToolbar
                editor={activeEditor}
                titleEditor={titleEditor}
                contentEditor={contentEditor}
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
