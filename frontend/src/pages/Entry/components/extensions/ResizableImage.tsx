import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { useRef, useEffect, useCallback } from 'react';
import styles from './ResizableImage.module.css';
import classNames from 'classnames';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        setImage: (options: { src: string; alt?: string; title?: string }) => ReturnType;
    }
}

export interface ResizableImageAttributes {
    src: string;
    alt?: string;
    title?: string;
    width?: number;
    height?: number;
    x?: number;
    y?: number;
    rotation?: number;
}

function getCumulativeScale(el: HTMLElement): number {
    let scale = 1;
    let cur: HTMLElement | null = el;
    while (cur) {
        const style = getComputedStyle(cur);
        const transform = style.transform;
        if (transform && transform !== 'none') {
            const m = new DOMMatrix(transform);
            scale *= m.a;
        }
        cur = cur.parentElement;
    }
    return scale === 0 ? 1 : scale;
}

const ImageNodeView = (props: any) => {
    const { node, updateAttributes, selected } = props;
    const { src, width, height, x, y, rotation, alt, title } = node.attrs;

    const wrapperRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    const state = useRef({
        x: x ?? 0,
        y: y ?? 0,
        width: width ?? 300,
        height: height ?? 0,
        rotation: rotation ?? 0,
    });

    const applyTransform = useCallback(() => {
        const el = wrapperRef.current;
        if (!el) return;
        const s = state.current;
        el.style.transform = `translate(${s.x}px, ${s.y}px) rotate(${s.rotation}deg)`;
        el.style.width = `${s.width}px`;
        if (s.height > 0) {
            el.style.height = `${s.height}px`;
        } else {
            el.style.height = 'auto';
        }
    }, []);

    useEffect(() => {
        state.current = {
            x: x ?? 0,
            y: y ?? 0,
            width: width ?? 300,
            height: height ?? 0,
            rotation: rotation ?? 0,
        };
        applyTransform();
    }, [x, y, width, height, rotation, applyTransform]);

    const onImgLoad = useCallback(() => {
        if (!imgRef.current) return;
        if (!state.current.height || state.current.height === 0) {
            const ratio = imgRef.current.naturalHeight / imgRef.current.naturalWidth;
            const h = Math.round(state.current.width * ratio);
            state.current.height = h;
            applyTransform();
        }
    }, [applyTransform]);

    const startDrag = useCallback((e: React.MouseEvent) => {
        if (e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();

        const scale = getCumulativeScale(wrapperRef.current!);
        const startX = e.clientX;
        const startY = e.clientY;
        const origX = state.current.x;
        const origY = state.current.y;

        const onMove = (ev: MouseEvent) => {
            const dx = (ev.clientX - startX) / scale;
            const dy = (ev.clientY - startY) / scale;
            state.current.x = origX + dx;
            state.current.y = origY + dy;
            applyTransform();
        };
        const onUp = () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
            updateAttributes({ x: state.current.x, y: state.current.y });
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    }, [applyTransform, updateAttributes]);

    const startResize = useCallback((e: React.MouseEvent, corner: 'nw' | 'ne' | 'sw' | 'se') => {
        if (e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();

        const scale = getCumulativeScale(wrapperRef.current!);
        const rad = (state.current.rotation * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        const startClientX = e.clientX;
        const startClientY = e.clientY;
        const origW = state.current.width;
        const origH = state.current.height > 0 ? state.current.height : (imgRef.current?.offsetHeight ?? origW);
        const ratio = origH / origW;

        const pivotLocalX = corner === 'ne' || corner === 'se' ? -origW / 2 : origW / 2;
        const pivotLocalY = corner === 'sw' || corner === 'se' ? -origH / 2 : origH / 2;

        const pivotWorldX = state.current.x + origW / 2 + cos * pivotLocalX - sin * pivotLocalY;
        const pivotWorldY = state.current.y + origH / 2 + sin * pivotLocalX + cos * pivotLocalY;

        const onMove = (ev: MouseEvent) => {
            const dx = (ev.clientX - startClientX) / scale;
            const dy = (ev.clientY - startClientY) / scale;

            const localDx = dx * cos + dy * sin;

            let newW: number;

            if (corner === 'se') {
                newW = Math.max(50, origW + localDx);
            } else if (corner === 'sw') {
                newW = Math.max(50, origW - localDx);
            } else if (corner === 'ne') {
                newW = Math.max(50, origW + localDx);
            } else {
                newW = Math.max(50, origW - localDx);
            }

            const newH = newW * ratio;

            const newHalfW = newW / 2;
            const newHalfH = newH / 2;

            const scaledPivotLocalX = (pivotLocalX / Math.abs(pivotLocalX)) * newHalfW;
            const scaledPivotLocalY = (pivotLocalY / Math.abs(pivotLocalY)) * newHalfH;
            const adjustedCenterX = pivotWorldX - cos * scaledPivotLocalX + sin * scaledPivotLocalY;
            const adjustedCenterY = pivotWorldY - sin * scaledPivotLocalX - cos * scaledPivotLocalY;

            state.current.width = newW;
            state.current.height = newH;
            state.current.x = adjustedCenterX - newHalfW;
            state.current.y = adjustedCenterY - newHalfH;
            applyTransform();
        };

        const onUp = () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
            updateAttributes({
                x: state.current.x,
                y: state.current.y,
                width: Math.round(state.current.width),
                height: Math.round(state.current.height),
            });
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    }, [applyTransform, updateAttributes]);

    const startRotate = useCallback((e: React.MouseEvent) => {
        if (e.button !== 0) return;
        e.preventDefault();
        e.stopPropagation();

        const el = wrapperRef.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
        const origRotation = state.current.rotation;

        const onMove = (ev: MouseEvent) => {
            const angle = Math.atan2(ev.clientY - centerY, ev.clientX - centerX) * (180 / Math.PI);
            state.current.rotation = origRotation + (angle - startAngle);
            applyTransform();
        };
        const onUp = () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
            updateAttributes({ rotation: state.current.rotation });
        };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    }, [applyTransform, updateAttributes]);

    useEffect(() => {
        if (!selected) return;

        const handle = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (wrapperRef.current?.contains(target)) return;
            if (target.closest('button') || target.closest('[class*="toolbar"]')) return;

            const { editor } = props;
            const pos = typeof props.getPos === 'function' ? props.getPos() : undefined;
            if (target.classList.contains('canvas') || target.classList.contains('editorContainer')) {
                editor.commands.blur();
            } else if (pos !== undefined) {
                editor.commands.setTextSelection(pos + 1);
            }
        };

        const id = setTimeout(() => document.addEventListener('mousedown', handle), 10);
        return () => {
            clearTimeout(id);
            document.removeEventListener('mousedown', handle);
        };
    }, [selected, props]);

    const s = {
        width: props.node.attrs.width ?? 300,
        height: props.node.attrs.height ?? 0,
        x: props.node.attrs.x ?? 0,
        y: props.node.attrs.y ?? 0,
        rotation: props.node.attrs.rotation ?? 0,
    };

    return (
        <NodeViewWrapper
            style={{
                display: 'block',
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: selected ? 100 : 1,
                pointerEvents: 'none',
            }}
        >
            <div
                ref={wrapperRef}
                className={classNames(styles.imageBox, { [styles.selected]: selected })}
                style={{
                    width: `${s.width}px`,
                    height: s.height > 0 ? `${s.height}px` : 'auto',
                    transform: `translate(${s.x}px, ${s.y}px) rotate(${s.rotation}deg)`,
                    transformOrigin: 'center center',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    pointerEvents: 'auto',
                    userSelect: 'none',
                    cursor: selected ? 'move' : 'default',
                    boxSizing: 'border-box',
                }}
                onMouseDown={selected ? startDrag : undefined}
            >
                <img
                    ref={imgRef}
                    src={src}
                    alt={alt}
                    title={title}
                    draggable={false}
                    onLoad={onImgLoad}
                    style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }}
                />

                {selected && (
                    <>
                        <div className={styles.selectionBorder} />

                        {(['nw', 'ne', 'sw', 'se'] as const).map(corner => (
                            <div
                                key={corner}
                                className={classNames(styles.handle, styles[corner])}
                                onMouseDown={(e) => {
                                    e.stopPropagation();
                                    startResize(e, corner);
                                }}
                            />
                        ))}

                        <div
                            className={styles.deleteButton}
                            title="Delete Image"
                            onClick={(e) => {
                                e.stopPropagation();
                                props.editor.commands.deleteSelection();
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18" />
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            </svg>
                        </div>

                        <div
                            className={styles.rotateHandle}
                            title="Rotate"
                            onMouseDown={(e) => {
                                e.stopPropagation();
                                startRotate(e);
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                                <path d="M21 3v5h-5" />
                            </svg>
                        </div>
                    </>
                )}
            </div>
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