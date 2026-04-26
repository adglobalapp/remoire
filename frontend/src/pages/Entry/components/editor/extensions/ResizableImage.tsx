import { Node, mergeAttributes, type CommandProps } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { useRef, useEffect, useCallback } from 'react';
import { Trash2 } from 'lucide-react';
import Moveable, { type OnDrag, type OnDragEnd, type OnResize, type OnResizeEnd, type OnRotate, type OnRotateEnd } from 'react-moveable';
import classNames from 'classnames';
import { useCanvasScale } from '../../../../../contexts/CanvasScaleContext';
import styles from './ResizableImage.module.css';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        resizableImage: {
            setImage: (options: { src: string; alt?: string; title?: string }) => ReturnType;
        };
    }
}

const ImageNodeView = (props: NodeViewProps) => {
    const { node, updateAttributes, selected } = props;
    const { src, width, height, x, y, rotation, alt, title } = node.attrs;

    const targetRef = useRef<HTMLDivElement>(null);
    const moveableRef = useRef<Moveable>(null);
    const canvasScale = useCanvasScale();

    const handleDrag = useCallback(
        ({ target, beforeTranslate }: OnDrag) => {
            target.style.transform = `translate(${beforeTranslate[0]}px, ${beforeTranslate[1]}px) rotate(${rotation ?? 0}deg)`;
        },
        [rotation],
    );

    const handleDragEnd = useCallback(
        ({ lastEvent }: OnDragEnd) => {
            if (lastEvent) {
                updateAttributes({
                    x: lastEvent.beforeTranslate[0],
                    y: lastEvent.beforeTranslate[1],
                });
            }
        },
        [updateAttributes],
    );

    const handleResize = useCallback(
        ({ target, width, height, drag }: OnResize) => {
            target.style.width = `${width}px`;
            target.style.height = `${height}px`;
            target.style.transform = `translate(${drag.beforeTranslate[0]}px, ${drag.beforeTranslate[1]}px) rotate(${rotation ?? 0}deg)`;
        },
        [rotation],
    );

    const handleResizeEnd = useCallback(
        ({ lastEvent }: OnResizeEnd) => {
            if (lastEvent) {
                updateAttributes({
                    width: lastEvent.width,
                    height: lastEvent.height,
                    x: lastEvent.drag.beforeTranslate[0],
                    y: lastEvent.drag.beforeTranslate[1],
                });
            }
        },
        [updateAttributes],
    );

    const handleRotate = useCallback(({ target, beforeRotate, drag }: OnRotate) => {
        target.style.transform = `translate(${drag.beforeTranslate[0]}px, ${drag.beforeTranslate[1]}px) rotate(${beforeRotate}deg)`;
    }, []);

    const handleRotateEnd = useCallback(
        ({ lastEvent }: OnRotateEnd) => {
            if (lastEvent) {
                updateAttributes({
                    rotation: lastEvent.beforeRotate,
                    x: lastEvent.drag.beforeTranslate[0],
                    y: lastEvent.drag.beforeTranslate[1],
                });
            }
        },
        [updateAttributes],
    );

    useEffect(() => {
        if (selected && moveableRef.current) {
            moveableRef.current.updateRect();
        }
    }, [selected, src, width, height, x, y, rotation, canvasScale]);

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

    const deleteScale = Math.min(1 / canvasScale, 1.5);
    const deleteBottom = -(8 + 12 * (1 + deleteScale));

    return (
        <NodeViewWrapper
            className={styles.nodeWrapper}
            style={{
                zIndex: selected ? 100 : 1,
                pointerEvents: selected ? 'auto' : 'none',
            }}
            onPointerDown={(e: React.PointerEvent) => {
                const target = e.target as HTMLElement;

                if (target.closest('.moveable-control-box')) return;

                if (window.innerWidth <= 800) {
                    props.editor.commands.blur();
                    setTimeout(() => props.editor.commands.blur(), 10);
                }

                if (!selected) {
                    const pos = typeof props.getPos === 'function' ? props.getPos() : undefined;
                    if (pos !== undefined) {
                        props.editor.commands.setNodeSelection(pos);
                    }
                }
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
                    onLoad={() => {
                        if (selected && moveableRef.current) {
                            moveableRef.current.updateRect();
                        }
                    }}
                    className={styles.imageContent}
                />

                {selected && (
                    <div
                        className={styles.deleteButton}
                        title="Delete Image"
                        style={{
                            transform: `translateX(-50%) scale(${deleteScale})`,
                            bottom: `${deleteBottom}px`,
                        }}
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
                    ref={moveableRef}
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
                parseHTML: (el) => el.getAttribute('src'),
                renderHTML: (attrs) => ({ src: attrs.src }),
            },
            alt: {
                default: null,
                parseHTML: (el) => el.getAttribute('alt'),
                renderHTML: (attrs) => ({ alt: attrs.alt }),
            },
            title: {
                default: null,
                parseHTML: (el) => el.getAttribute('title'),
                renderHTML: (attrs) => ({ title: attrs.title }),
            },
            width: {
                default: 300,
                parseHTML: (el) => parseFloat(el.getAttribute('data-width') || '300'),
                renderHTML: (attrs) => ({ 'data-width': attrs.width }),
            },
            height: {
                default: 0,
                parseHTML: (el) => parseFloat(el.getAttribute('data-height') || '0'),
                renderHTML: (attrs) => ({ 'data-height': attrs.height }),
            },
            rotation: {
                default: 0,
                parseHTML: (el) => parseFloat(el.getAttribute('data-rotation') || '0'),
                renderHTML: (attrs) => ({ 'data-rotation': attrs.rotation }),
            },
            x: {
                default: 0,
                parseHTML: (el) => parseFloat(el.getAttribute('data-x') || '0'),
                renderHTML: (attrs) => ({ 'data-x': attrs.x }),
            },
            y: {
                default: 0,
                parseHTML: (el) => parseFloat(el.getAttribute('data-y') || '0'),
                renderHTML: (attrs) => ({ 'data-y': attrs.y }),
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
            setImage:
                (options: { src: string; alt?: string; title?: string }) =>
                ({ commands }: CommandProps) =>
                    commands.insertContent({ type: this.name, attrs: options }),
        };
    },
});
