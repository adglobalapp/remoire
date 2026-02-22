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

interface EntryEditorProps {
    initialTitle?: string;
    initialContent?: string;
}

const EntryEditor = ({ initialTitle = 'Untitled', initialContent = '' }: EntryEditorProps) => {
    const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
    const [isDragging, setIsDragging] = useState(false);
    const [isDragMode, setIsDragMode] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
    const [activeEditor, setActiveEditor] = useState<Editor | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const contentEditor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            ResizableImage,
            Placeholder.configure({
                placeholder: 'Dear Diary...',
            }),
            TextStyle,
            FontFamily.configure({
                types: ['textStyle'],
            }),
            Color,
            FontSize,
        ],
        content: initialContent,
        editable: !isDragMode,
        onCreate: ({ editor }) => {
            if (!initialContent) {
                editor.chain().focus().setFontFamily("'Kaushan Script', cursive").run();
            }
            setActiveEditor(editor);
        },
        onFocus: ({ editor }) => {
            setActiveEditor(editor);
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
            Color,
            Placeholder.configure({
                placeholder: 'Entry Title',
            }),
        ],
        content: `<h1>${initialTitle}</h1>`,
        editable: !isDragMode,
        onCreate: ({ editor }) => {
            setActiveEditor(editor);
        },
        onFocus: ({ editor }) => {
            setActiveEditor(editor);
        },
    });

    useEffect(() => {
        contentEditor?.setEditable(!isDragMode);
        titleEditor?.setEditable(!isDragMode);
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

            // Accurate zoom-at-point for transform-origin: 0 0
            // t2 = m - (m - t1) * s2 / s1
            const nextX = mouseX - (mouseX - prev.x) * nextScale / prev.scale;
            const nextY = mouseY - (mouseY - prev.y) * nextScale / prev.scale;

            return { x: nextX, y: nextY, scale: nextScale };
        });
    }, []);

    const handleMouseDown = (e: React.MouseEvent) => {
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

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

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

        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
        };

        container.addEventListener('wheel', onWheel, { passive: false });

        // Set initial transform: Zoomed in and centered horizontally
        const width = container.offsetWidth;
        const initialScale = 1.15;
        const initialX = (width / 2) * (1 - initialScale);
        // y: 0 starts at the top of the canvas
        setTransform({ x: initialX, y: 0, scale: initialScale });

        return () => container.removeEventListener('wheel', onWheel);
    }, []);

    return (
        <>
            <div
                ref={containerRef}
                className={classNames(styles.editorContainer, {
                    [styles.noSelect]: isDragging,
                    [styles.dragMode]: isDragMode
                })}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onClick={(e) => {
                    const target = e.target as Element;
                    if (target === containerRef.current || target.classList?.contains(styles.canvas)) {
                        if (contentEditor) {
                            contentEditor.chain().setTextSelection(contentEditor.state.selection.from).blur().run();
                        }
                        if (titleEditor) {
                            titleEditor.chain().setTextSelection(titleEditor.state.selection.from).blur().run();
                        }
                    }
                }}
            >
                <div
                    className={styles.canvas}
                    style={{
                        transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                    }}
                >
                    <div
                        className={styles.paper}
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
                </div>
            </div>

            <EditorToolbar
                editor={activeEditor}
                isDragMode={isDragMode}
                onToggleDragMode={() => setIsDragMode(!isDragMode)}
            />
        </>
    );
};

export default EntryEditor;
