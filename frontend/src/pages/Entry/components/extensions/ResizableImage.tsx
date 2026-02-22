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

// Get the cumulative scale factor from an element up to the editor root,
// so pointer deltas can be converted to local-space distances.
function getCumulativeScale(el: HTMLElement): number {
    let scale = 1;
    let cur: HTMLElement | null = el;
    while (cur) {
        const m = new DOMMatrix(getComputedStyle(cur).transform);
        // The 'a' component of a 2D matrix is scaleX (assuming uniform scale)
        scale *= m.a;
        cur = cur.parentElement;
        // Stop at the editor root (ProseMirror)
        if (cur && cur.classList.contains('ProseMirror')) break;
    }
    return scale === 0 ? 1 : scale;
}

const ImageNodeView = (props: any) => {
    const { node, updateAttributes, selected } = props;
    const { src, width, height, x, y, rotation, alt, title } = node.attrs;

    const wrapperRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    // Local mutable state for live drags (avoids React re-renders mid-drag)
    const state = useRef({
        x: x ?? 0,
        y: y ?? 0,
        width: width ?? 300,
        height: height ?? 0,
        rotation: rotation ?? 0,
    });

    // Keep ref in sync with Tiptap attributes
    useEffect(() => {
        state.current = {
            x: x ?? 0,
            y: y ?? 0,
            width: width ?? 300,
            height: height ?? 0,
            rotation: rotation ?? 0,
        };
        applyTransform();
    }, [x, y, width, height, rotation]);

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

    // Once image is loaded, capture its natural height if not set
    const onImgLoad = useCallback(() => {
        if (!imgRef.current) return;
        if (!state.current.height || state.current.height === 0) {
            const ratio = imgRef.current.naturalHeight / imgRef.current.naturalWidth;
            const h = Math.round(state.current.width * ratio);
            state.current.height = h;
            applyTransform();
        }
    }, [applyTransform]);

    // ──────────────────────────────────────────────
    // DRAG (move)
    // ──────────────────────────────────────────────
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
            state.current.x = origX + (ev.clientX - startX) / scale;
            state.current.y = origY + (ev.clientY - startY) / scale;
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

    // ──────────────────────────────────────────────
    // RESIZE (4 corner handles)
    // ──────────────────────────────────────────────
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

        // Pivot is the opposite corner in local space (relative to center)
        const pivotLocalX = corner === 'ne' || corner === 'se' ? -origW / 2 : origW / 2;
        const pivotLocalY = corner === 'sw' || corner === 'se' ? -origH / 2 : origH / 2;

        // Pivot in world space (before resize)
        const pivotWorldX = state.current.x + origW / 2 + cos * pivotLocalX - sin * pivotLocalY;
        const pivotWorldY = state.current.y + origH / 2 + sin * pivotLocalX + cos * pivotLocalY;

        const onMove = (ev: MouseEvent) => {
            const dx = (ev.clientX - startClientX) / scale;
            const dy = (ev.clientY - startClientY) / scale;

            // Project delta onto the image's local axes
            const localDx = dx * cos + dy * sin;

            let newW: number;
            let newH: number;

            if (corner === 'se') {
                newW = Math.max(50, origW + localDx);
            } else if (corner === 'sw') {
                newW = Math.max(50, origW - localDx);
            } else if (corner === 'ne') {
                newW = Math.max(50, origW + localDx);
            } else {
                newW = Math.max(50, origW - localDx);
            }

            newH = newW * ratio;

            // Re-compute top-left so that the pivot corner stays fixed
            const newHalfW = newW / 2;
            const newHalfH = newH / 2;

            // Adjust center based on new size
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

    // ──────────────────────────────────────────────
    // ROTATE
    // ──────────────────────────────────────────────
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

    // Click outside to deselect
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

    const s = state.current;

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
                    style={{ width: '100%', height: '100%', display: 'block', objectFit: 'fill' }}
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