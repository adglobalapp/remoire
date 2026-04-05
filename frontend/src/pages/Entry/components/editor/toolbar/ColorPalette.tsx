import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Palette } from 'lucide-react';
import classNames from 'classnames';
import { type ColorPaletteProps } from '../../../../../types';
import styles from './ColorPalette.module.css';

const PRESET_COLORS = [
    '#493627', '#E4E0E1', '#D6C0B3', '#AB886D',
    '#2C3E50', '#E74C3C', '#27AE60', '#F1C40F',
    '#8E44AD', '#3498DB', '#16A085', '#D35400',
    '#FFC0CB', '#B0C4DE', '#98FB98', '#FFFACD'
];

const rgbToHex = (color: string) => {
    if (!color || typeof color !== 'string') return '#493627';
    if (color.startsWith('#')) return color;
    const match = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)$/);
    if (!match) return color;
    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
};

const ColorPalette = ({ editor, isDragMode, onColorPickerToggle }: ColorPaletteProps) => {
    const [currentColor, setCurrentColor] = useState('#493627');
    const [recentColors, setRecentColors] = useState<string[]>([]);
    const [showPalette, setShowPalette] = useState(false);

    const isPickingColorRef = useRef(false);
    const paletteRef = useRef<HTMLDivElement>(null);
    const originalColorRef = useRef<string | null>(null);
    const lastPreviewTimeRef = useRef<number>(0);

    // Update color states on editor changes
    useEffect(() => {
        if (!editor) return;

        const updateRecentColors = () => {
            const colors = new Set<string>();
            editor.state.doc.descendants((node) => {
                if (node.marks) {
                    node.marks.forEach((mark) => {
                        if (mark.type.name === 'textStyle' && mark.attrs.color) {
                            colors.add(mark.attrs.color.toLowerCase());
                        }
                    });
                }
                return true;
            });
            const combined = Array.from(colors).reverse();
            setRecentColors(combined.filter(c => !PRESET_COLORS.includes(c.toUpperCase()) && !PRESET_COLORS.includes(c.toLowerCase())).slice(0, 10));
        };

        const updateState = () => {
            if (isPickingColorRef.current) return;

            try {
                let attrs = editor.getAttributes('textStyle');

                // Color fallback detection
                const focusedElement = editor.view.dom.querySelector('.ProseMirror-focused');
                if (attrs.color) {
                    setCurrentColor(attrs.color);
                } else if (focusedElement) {
                    const style = window.getComputedStyle(focusedElement);
                    setCurrentColor(rgbToHex(style.color));
                }
            } catch (err) {
                console.warn('Toolbar color update error:', err);
            }
            updateRecentColors();
        };

        const handleFocus = () => {
            isPickingColorRef.current = false;
            onColorPickerToggle?.(false);
        };

        editor.on('selectionUpdate', updateState);
        editor.on('transaction', updateState);
        editor.on('focus', handleFocus);

        return () => {
            editor.off('selectionUpdate', updateState);
            editor.off('transaction', updateState);
            editor.off('focus', handleFocus);
        };
    }, [editor, onColorPickerToggle]);

    // Handle clicks outside the palette to close it
    useEffect(() => {
        if (!showPalette) return;

        const handleGlobalClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (paletteRef.current && !paletteRef.current.contains(target)) {
                setShowPalette(false);
                isPickingColorRef.current = false;
                onColorPickerToggle?.(false);
            }
        };

        document.addEventListener('mousedown', handleGlobalClick);
        return () => document.removeEventListener('mousedown', handleGlobalClick);
    }, [showPalette, onColorPickerToggle]);

    const applyColor = (color: string) => {
        setCurrentColor(color);
        editor.chain().setColor(color).run();
        setShowPalette(false);
        isPickingColorRef.current = false;
        onColorPickerToggle?.(false);
    };

    return (
        <div className={styles.paletteContainer} ref={paletteRef}>
            <button
                type="button"
                disabled={isDragMode}
                className={classNames(styles.actionButton, { [styles.isActive]: showPalette })}
                onClick={(e) => {
                    e.stopPropagation();
                    setShowPalette(!showPalette);
                }}
                title="Color Palette"
            >
                <Palette size={18} />
            </button>

            {showPalette && createPortal(
                <div
                    className={styles.palettePopup}
                    onMouseDown={(e) => e.stopPropagation()}
                    style={{
                        position: 'fixed',
                        bottom: `${window.innerHeight - (paletteRef.current?.getBoundingClientRect().top ?? 0) + 8}px`,
                        left: `${(paletteRef.current?.getBoundingClientRect().left ?? 0) + ((paletteRef.current?.getBoundingClientRect().width ?? 0) / 2)}px`,
                        transform: 'translateX(-50%)',
                        zIndex: 10000
                    }}
                >
                    <div className={styles.paletteSection}>
                        <div className={styles.paletteLabel}>Preset Colors</div>
                        <div className={styles.colorGrid}>
                            {PRESET_COLORS.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    className={styles.colorSquare}
                                    style={{ backgroundColor: color }}
                                    onClick={() => applyColor(color)}
                                />
                            ))}
                        </div>
                    </div>

                    {recentColors.length > 0 && (
                        <div className={styles.paletteSection}>
                            <div className={styles.paletteLabel}>Recent in Document</div>
                            <div className={styles.colorGrid}>
                                {recentColors.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        className={styles.colorSquare}
                                        style={{ backgroundColor: color }}
                                        onClick={() => applyColor(color)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    <div className={styles.paletteDivider} />

                    <div className={styles.customColorSection}>
                        <div className={styles.paletteLabel}>Custom Color</div>
                        <div className={styles.colorInputWrapper}>
                            <input
                                type="color"
                                className={styles.colorPicker}
                                value={currentColor}
                                ref={(node) => {
                                    if (node) {
                                        if (!(node as any)._hasChangeHandler) {
                                            (node as any)._hasChangeHandler = true;
                                            node.addEventListener('change', (e) => {
                                                const val = (e.target as HTMLInputElement).value;
                                                if (originalColorRef.current !== null) {
                                                    const { from, to } = editor.state.selection;
                                                    const tr = editor.state.tr.setMeta('addToHistory', false);
                                                    const markType = editor.schema.marks.textStyle;
                                                    editor.state.doc.nodesBetween(from, to, (node, pos) => {
                                                        if (!node.isText) return;
                                                        const existingMark = node.marks.find(m => m.type === markType);
                                                        const newAttrs = existingMark ? { ...existingMark.attrs, color: originalColorRef.current } : { color: originalColorRef.current };
                                                        tr.addMark(Math.max(from, pos), Math.min(to, pos + node.nodeSize), markType.create(newAttrs));
                                                    });
                                                    editor.view.dispatch(tr);
                                                }
                                                editor.chain().setColor(val).run();
                                                originalColorRef.current = null;
                                                isPickingColorRef.current = false;
                                                onColorPickerToggle?.(false);
                                            });
                                        }
                                    }
                                }}
                                onFocus={() => {
                                    isPickingColorRef.current = true;
                                    originalColorRef.current = editor.getAttributes('textStyle').color || '#493627';
                                    onColorPickerToggle?.(true);
                                }}
                                onInput={(e) => {
                                    const val = (e.target as HTMLInputElement).value;
                                    setCurrentColor(val);
                                    const now = Date.now();
                                    if (now - lastPreviewTimeRef.current > 32) {
                                        lastPreviewTimeRef.current = now;
                                        const { from, to } = editor.state.selection;
                                        const tr = editor.state.tr.setMeta('addToHistory', false).setMeta('isColorPreview', true);
                                        const markType = editor.schema.marks.textStyle;
                                        editor.state.doc.nodesBetween(from, to, (node, pos) => {
                                            if (!node.isText) return;
                                            const existingMark = node.marks.find(m => m.type === markType);
                                            const newAttrs = existingMark ? { ...existingMark.attrs, color: val } : { color: val };
                                            tr.addMark(Math.max(from, pos), Math.min(to, pos + node.nodeSize), markType.create(newAttrs));
                                        });
                                        editor.view.dispatch(tr);
                                    }
                                }}
                                onClick={() => {
                                    isPickingColorRef.current = true;
                                    originalColorRef.current = editor.getAttributes('textStyle').color || '#493627';
                                    onColorPickerToggle?.(true);
                                }}
                            />
                            <span className={styles.colorHex}>{currentColor.toUpperCase()}</span>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default ColorPalette;
