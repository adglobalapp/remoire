import { Node, mergeAttributes, type CommandProps } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { useRef, useEffect, useCallback } from 'react';
import { Trash2 } from 'lucide-react';
import Moveable, { type OnDrag, type OnResize, type OnRotate, type OnDragEnd, type OnResizeEnd, type OnRotateEnd } from 'react-moveable';
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

    const updateStyle = useCallback((e: OnDrag | OnResize | OnRotate) => {
        const target = e.target as HTMLElement;
        if ('transform' in e) target.style.transform = e.transform;
        if ('width' in e) target.style.width = `${(e as OnResize).width}px`;
        if ('height' in e) target.style.height = `${(e as OnResize).height}px`;
    }, []);

    const handleEnd = useCallback(
        (e: OnDragEnd | OnResizeEnd | OnRotateEnd) => {
            const { lastEvent } = e;
            if (!lastEvent) return;

            const drag = 'drag' in lastEvent ? (lastEvent as OnResize | OnRotate).drag : (lastEvent as OnDrag);
            const attrs: Record<string, number | string | null> = {
                x: drag.beforeTranslate[0],
                y: drag.beforeTranslate[1],
            };

            if ('width' in lastEvent) {
                attrs.width = lastEvent.width;
                attrs.height = lastEvent.height;
            }
            if ('beforeRotate' in lastEvent) {
                attrs.rotation = lastEvent.beforeRotate;
            }
            updateAttributes(attrs);
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
            if (targetRef.current?.contains(target) || target.closest('button, [class*="toolbar"], .moveable-control-box')) return;

            const pos = typeof props.getPos === 'function' ? props.getPos() : undefined;
            if (target.matches(`.${styles.canvas}, .${styles.editorContainer}`)) {
                props.editor.commands.blur();
            } else if (pos !== undefined) {
                props.editor.commands.setTextSelection(pos + 1);
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

                if (target.closest(`.${styles.deleteButton}`) || target.closest('.moveable-control-box')) return;

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
                        onPointerDown={(e) => {
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
                    onDrag={updateStyle}
                    onDragEnd={handleEnd}
                    onResize={updateStyle}
                    onResizeEnd={handleEnd}
                    onRotate={updateStyle}
                    onRotateEnd={handleEnd}
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
        const numAttr = (name: string, def = 0) => ({
            default: def,
            parseHTML: (el: HTMLElement) => parseFloat(el.getAttribute(`data-${name}`) || String(def)),
            renderHTML: (attrs: Record<string, unknown>) => ({ [`data-${name}`]: attrs[name] as string | number }),
        });

        return {
            src: {
                default: null,
                parseHTML: (el) => el.getAttribute('src'),
                renderHTML: (a: Record<string, unknown>) => ({ src: a.src as string }),
            },
            alt: {
                default: null,
                parseHTML: (el) => el.getAttribute('alt'),
                renderHTML: (a: Record<string, unknown>) => ({ alt: a.alt as string }),
            },
            title: {
                default: null,
                parseHTML: (el) => el.getAttribute('title'),
                renderHTML: (a: Record<string, unknown>) => ({ title: a.title as string }),
            },
            width: numAttr('width', 300),
            height: numAttr('height', 0),
            rotation: numAttr('rotation', 0),
            x: numAttr('x', 0),
            y: numAttr('y', 0),
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
