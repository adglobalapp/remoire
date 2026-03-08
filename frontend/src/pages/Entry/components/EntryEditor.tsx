import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { ResizableImage } from './extensions/ResizableImage';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import { Color } from '@tiptap/extension-color';
import { FontSize } from './extensions/FontSize';
import { useState, useRef, useCallback, useEffect } from 'react';
import EditorToolbar from './EditorToolbar';
import styles from './EntryEditor.module.css';
import classNames from 'classnames';
import { useEntryContext } from '../../../contexts/EntryContext';

export interface PageSettings {
    backgroundUrl: string | null;
    paddingTop: number;
    paddingRight: number;
    paddingBottom: number;
    paddingLeft: number;
}

export const DEFAULT_PAGE_SETTINGS: PageSettings = {
    backgroundUrl: null,
    paddingTop: 56,
    paddingRight: 75,
    paddingBottom: 56,
    paddingLeft: 75,
};

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
        onUpdate: ({ editor }) => {
            if (!activeEntry) return;
            const titleHTML = titleEditor?.getHTML() ?? `<h1>${activeEntry.title}</h1>`;
            const titleText = titleEditor?.getText() || 'Untitled';
            const contentJSON = editor.getJSON();
            const serialized = JSON.stringify({ titleHTML, contentJSON, pageSettings: pageSettingsRef.current });
            saveEntry(activeEntry.id, titleText, serialized);
        },
    });

    const titleEditor = useEditor({
        extensions: [
            StarterKit.configure({
                codeBlock: false,
                bulletList: false,
                orderedList: false,
                blockquote: false,
            }),
            Underline,
            TextStyle,
            FontFamily.configure({ types: ['textStyle'] }),
            FontSize,
            Color,
            Placeholder.configure({ placeholder: 'Entry Title' }),
        ],
        content: getInitialTitle(),
        editable: !isDragMode,
        onCreate: ({ editor }) => setActiveEditor(editor),
        onFocus: ({ editor }) => setActiveEditor(editor),
        onUpdate: ({ editor }) => {
            if (!activeEntry) return;
            const titleText = editor.getText() || 'Untitled';
            updateEntryTitle(activeEntry.id, titleText);
            const titleHTML = editor.getHTML();
            const contentJSON = contentEditor?.getJSON() ?? null;
            const serialized = JSON.stringify({ titleHTML, contentJSON, pageSettings: pageSettingsRef.current });
            saveEntry(activeEntry.id, titleText, serialized);
        },
    });

    useEffect(() => {
        if (!activeEntry) return;
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

        // Wrap setting state in a microtask to avoid "setState during render" or "cascading renders" warnings
        Promise.resolve().then(() => {
            setPageSettings(settings);
            pageSettingsRef.current = settings;
        });

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
    }, [activeEntry, titleEditor, contentEditor]);



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
        mouseDownTargetRef.current = e.target;
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
                                    contentEditor?.chain().focus('end').run();
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
                onPageSettingsChange={(newSettings) => {
                    setPageSettings(newSettings);
                    pageSettingsRef.current = newSettings;
                    // Trigger save
                    if (activeEntry && titleEditor) {
                        const titleText = titleEditor.getText() || 'Untitled';
                        const titleHTML = titleEditor.getHTML();
                        const contentJSON = contentEditor?.getJSON() ?? null;
                        const serialized = JSON.stringify({ titleHTML, contentJSON, pageSettings: newSettings });
                        saveEntry(activeEntry.id, titleText, serialized);
                    }
                }}
            />
        </>
    );
};

export default EntryEditor;
