import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { useRef, useEffect, useCallback } from 'react';
import { Trash2 } from 'lucide-react';
import Moveable from 'react-moveable';
import { useCanvasScale } from '../../../../contexts/CanvasScaleContext';
import styles from './ResizableImage.module.css';
import classNames from 'classnames';

const ImageNodeView = (props: any) => {
    const { node, updateAttributes, selected } = props;
    const { src, width, height, x, y, rotation, alt, title } = node.attrs;

    const targetRef = useRef<HTMLDivElement>(null);
    const canvasScale = useCanvasScale();

    // Image actions
    const handleDrag = useCallback(({ target, beforeTranslate }: any) => {
        target.style.transform = `translate(${beforeTranslate[0]}px, ${beforeTranslate[1]}px) rotate(${rotation ?? 0}deg)`;
    }, [rotation]);

    const handleDragEnd = useCallback(({ lastEvent }: any) => {
        if (lastEvent) {
            updateAttributes({
                x: lastEvent.beforeTranslate[0],
                y: lastEvent.beforeTranslate[1],
            });
        }
    }, [updateAttributes]);

    const handleResize = useCallback(({ target, width, height, drag }: any) => {
        target.style.width = `${width}px`;
        target.style.height = `${height}px`;
        target.style.transform = `translate(${drag.beforeTranslate[0]}px, ${drag.beforeTranslate[1]}px) rotate(${rotation ?? 0}deg)`;
    }, [rotation]);

    const handleResizeEnd = useCallback(({ lastEvent }: any) => {
        if (lastEvent) {
            updateAttributes({
                width: lastEvent.width,
                height: lastEvent.height,
                x: lastEvent.drag.beforeTranslate[0],
                y: lastEvent.drag.beforeTranslate[1],
            });
        }
    }, [updateAttributes]);

    const handleRotate = useCallback(({ target, beforeRotate, drag }: any) => {
        target.style.transform = `translate(${drag.beforeTranslate[0]}px, ${drag.beforeTranslate[1]}px) rotate(${beforeRotate}deg)`;
    }, []);

    const handleRotateEnd = useCallback(({ lastEvent }: any) => {
        if (lastEvent) {
            updateAttributes({
                rotation: lastEvent.beforeRotate,
                x: lastEvent.drag.beforeTranslate[0],
                y: lastEvent.drag.beforeTranslate[1],
            });
        }
    }, [updateAttributes]);

    // Image selection
    useEffect(() => {
        if (!selected) return;

        const handleMouseDown = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (targetRef.current?.contains(target)) return;
            if (target.closest('button') || target.closest('[class*="toolbar"]') || target.closest('.moveable-control-box')) return;

            const { editor } = props;
            const pos = typeof props.getPos === 'function' ? props.getPos() : undefined;
            if (target.classList.contains('canvas') || target.classList.contains('editorContainer')) {
                editor.commands.blur();
            } else if (pos !== undefined) {
                editor.commands.setTextSelection(pos + 1);
            }
        };

        const id = setTimeout(() => document.addEventListener('mousedown', handleMouseDown), 10);
        return () => {
            clearTimeout(id);
            document.removeEventListener('mousedown', handleMouseDown);
        };
    }, [selected, props]);

    const w = width ?? 300;
    const h = height > 0 ? height : 'auto';

    return (
        <NodeViewWrapper
            style={{
                display: 'block',
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: selected ? 100 : 1,
                pointerEvents: selected ? 'auto' : 'none',
            }}
        >
            <div
                ref={targetRef}
                className={classNames(styles.imageBox, { [styles.selected]: selected })}
                style={{
                    width: `${w}px`,
                    height: h === 'auto' ? 'auto' : `${h}px`,
                    transform: `translate(${x ?? 0}px, ${y ?? 0}px) rotate(${rotation ?? 0}deg)`,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    pointerEvents: 'auto',
                    cursor: selected ? 'move' : 'default',
                }}
            >
                <img
                    src={src}
                    alt={alt}
                    title={title}
                    draggable={false}
                    style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }}
                />

                {selected && (
                    <div
                        className={styles.deleteButton}
                        title="Delete Image"
                        style={{ transform: `translateX(-50%) scale(${1 / canvasScale})` }}
                        onClick={(e) => {
                            e.stopPropagation();
                            props.editor.commands.deleteSelection();
                        }}
                    >
                        <Trash2 size={14} />
                    </div>
                )}
            </div>

            {selected && (
                <Moveable
                    target={targetRef}
                    draggable={true}
                    resizable={true}
                    rotatable={true}
                    keepRatio={true}
                    rootContainer={document.body}
                    throttleDrag={0}
                    throttleResize={0}
                    throttleRotate={0}
                    zoom={1 / canvasScale}
                    renderDirections={['nw', 'ne', 'sw', 'se']}
                    origin={false}
                    onDrag={handleDrag}
                    onDragEnd={handleDragEnd}
                    onResize={handleResize}
                    onResizeEnd={handleResizeEnd}
                    onRotate={handleRotate}
                    onRotateEnd={handleRotateEnd}
                    className={styles.moveableControl}
                />
            )}
        </NodeViewWrapper>
    );
};

export const ResizableImage = Node.create({
    name: 'resizableImage',

    addOptions() {
        return { HTMLAttributes: {} };
    },

    group: 'block',
    draggable: false,

    addAttributes() {
        return {
            src: {
                default: null,
                parseHTML: el => el.getAttribute('src'),
                renderHTML: attrs => ({ src: attrs.src }),
            },
            alt: {
                default: null,
                parseHTML: el => el.getAttribute('alt'),
                renderHTML: attrs => ({ alt: attrs.alt }),
            },
            title: {
                default: null,
                parseHTML: el => el.getAttribute('title'),
                renderHTML: attrs => ({ title: attrs.title }),
            },
            width: {
                default: 300,
                parseHTML: el => parseFloat(el.getAttribute('data-width') || '300'),
                renderHTML: attrs => ({ 'data-width': attrs.width }),
            },
            height: {
                default: 0,
                parseHTML: el => parseFloat(el.getAttribute('data-height') || '0'),
                renderHTML: attrs => ({ 'data-height': attrs.height }),
            },
            rotation: {
                default: 0,
                parseHTML: el => parseFloat(el.getAttribute('data-rotation') || '0'),
                renderHTML: attrs => ({ 'data-rotation': attrs.rotation }),
            },
            x: {
                default: 0,
                parseHTML: el => parseFloat(el.getAttribute('data-x') || '0'),
                renderHTML: attrs => ({ 'data-x': attrs.x }),
            },
            y: {
                default: 0,
                parseHTML: el => parseFloat(el.getAttribute('data-y') || '0'),
                renderHTML: attrs => ({ 'data-y': attrs.y }),
            },
        };
    },

    parseHTML() {
        return [{ tag: 'img[src]' }];
    },

    renderHTML({ HTMLAttributes }) {
        return ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
    },

    addNodeView() {
        return ReactNodeViewRenderer(ImageNodeView);
    },

    addCommands() {
        return {
            setImage: (options: { src: string; alt?: string; title?: string }) =>
                ({ commands }: any) =>
                    commands.insertContent({ type: this.name, attrs: options }),
        } as any;
    },
});