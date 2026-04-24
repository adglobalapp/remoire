import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Palette } from 'lucide-react';
import classNames from 'classnames';
import { type ColorPaletteProps } from '../../../../../types';
import { PRESET_COLORS } from '../../../../../utils/constants';
import styles from './ColorPalette.module.css';

const rgbToHex = (color: string) => {
    if (!color || typeof color !== 'string') return '#493627';
    if (color.startsWith('#')) return color;
    const match = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)$/);
    if (!match) return color;
    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
};

const ColorPalette = ({ editor, isDragMode, onColorPickerToggle }: ColorPaletteProps) => {
    const [currentColor, setCurrentColor] = useState('#493627');
    const [recentColors, setRecentColors] = useState<string[]>([]);
    const [showPalette, setShowPalette] = useState(false);

    const isPickingColorRef = useRef(false);
    const paletteRef = useRef<HTMLDivElement>(null);
    const originalColorRef = useRef<string | null>(null);
    const lastPreviewTimeRef = useRef<number>(0);

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
            setRecentColors(
                combined.filter((c) => !PRESET_COLORS.includes(c.toUpperCase()) && !PRESET_COLORS.includes(c.toLowerCase())).slice(0, 10),
            );
        };

        const updateState = (props?: { transaction?: any }) => {
            if (isPickingColorRef.current) return;

            try {
                const { empty } = editor.state.selection;
                let color = null;

                if (empty) {
                    const marks = editor.state.selection.$from.marks();
                    const colorMark = marks.find((m) => m.type.name === 'textStyle' && m.attrs.color);
                    if (colorMark) {
                        color = colorMark.attrs.color;
                    }
                } else {
                    color = editor.getAttributes('textStyle').color;
                }

                if (color) {
                    setCurrentColor(color);
                } else {
                    const style = window.getComputedStyle(editor.view.dom);
                    setCurrentColor(rgbToHex(style.color));
                }

                const isPreview = props?.transaction?.getMeta('isColorPreview');
                if (!isPreview) {
                    updateRecentColors();
                }
            } catch (err) {
                console.warn('Toolbar color update error:', err);
            }
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

    const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

    useEffect(() => {
        if (showPalette && paletteRef.current) {
            setAnchorRect(paletteRef.current.getBoundingClientRect());
        }
    }, [showPalette]);

    useEffect(() => {
        if (!showPalette) return;

        const handleResize = () => {
            if (paletteRef.current) {
                setAnchorRect(paletteRef.current.getBoundingClientRect());
            }
        };

        const handleGlobalClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (paletteRef.current && !paletteRef.current.contains(target)) {
                setShowPalette(false);
                isPickingColorRef.current = false;
                onColorPickerToggle?.(false);
            }
        };

        document.addEventListener('mousedown', handleGlobalClick);
        window.addEventListener('resize', handleResize);
        return () => {
            document.removeEventListener('mousedown', handleGlobalClick);
            window.removeEventListener('resize', handleResize);
        };
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
                className={classNames(styles.actionButton, {
                    [styles.isActive]: showPalette,
                })}
                onClick={(e) => {
                    e.stopPropagation();
                    setShowPalette(!showPalette);
                }}
                title="Color Palette"
            >
                <Palette size={18} />
                <div className={styles.colorIndicator} style={{ backgroundColor: currentColor }} />
            </button>

            {showPalette &&
                anchorRect &&
                createPortal(
                    <div
                        className={styles.palettePopup}
                        onMouseDown={(e) => e.stopPropagation()}
                        style={{
                            position: 'fixed',
                            bottom: `${window.innerHeight - anchorRect.top + 8}px`,
                            left: `${anchorRect.left + anchorRect.width / 2}px`,
                            transform: 'translateX(-50%)',
                            zIndex: 10000,
                        }}
                    >
                        {recentColors.length > 0 && (
                            <>
                                <div className={styles.paletteSection}>
                                    <div className={styles.paletteLabel}>Document colors</div>
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
                                <div className={styles.paletteDivider} />
                            </>
                        )}

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

                        <div className={styles.paletteDivider} />

                        <div className={styles.customColorSection}>
                            <div className={styles.paletteLabel}>Custom Color</div>
                            <div className={styles.colorInputWrapper}>
                                <input
                                    type="color"
                                    className={styles.colorPicker}
                                    value={currentColor}
                                    onFocus={() => {
                                        isPickingColorRef.current = true;
                                        originalColorRef.current = editor.getAttributes('textStyle').color || '#493627';
                                        onColorPickerToggle?.(true);
                                    }}
                                    onInput={(e) => {
                                        const val = (e.currentTarget as HTMLInputElement).value;
                                        setCurrentColor(val);
                                        const now = Date.now();
                                        if (now - lastPreviewTimeRef.current > 32) {
                                            lastPreviewTimeRef.current = now;
                                            const { from, to } = editor.state.selection;
                                            const tr = editor.state.tr.setMeta('addToHistory', false).setMeta('isColorPreview', true);
                                            const markType = editor.schema.marks.textStyle;
                                            editor.state.doc.nodesBetween(from, to, (node, pos) => {
                                                if (!node.isText) return;
                                                const existingMark = node.marks.find((m) => m.type === markType);
                                                const newAttrs = existingMark ? { ...existingMark.attrs, color: val } : { color: val };
                                                tr.addMark(
                                                    Math.max(from, pos),
                                                    Math.min(to, pos + node.nodeSize),
                                                    markType.create(newAttrs),
                                                );
                                            });
                                            editor.view.dispatch(tr);
                                        }
                                    }}
                                    onChange={(e) => {
                                        const val = (e.currentTarget as HTMLInputElement).value;
                                        if (originalColorRef.current !== null) {
                                            const { from, to } = editor.state.selection;
                                            const tr = editor.state.tr.setMeta('addToHistory', false);
                                            const markType = editor.schema.marks.textStyle;
                                            editor.state.doc.nodesBetween(from, to, (node, pos) => {
                                                if (!node.isText) return;
                                                const existingMark = node.marks.find((m) => m.type === markType);
                                                const newAttrs = existingMark
                                                    ? {
                                                          ...existingMark.attrs,
                                                          color: originalColorRef.current,
                                                      }
                                                    : { color: originalColorRef.current };
                                                tr.addMark(
                                                    Math.max(from, pos),
                                                    Math.min(to, pos + node.nodeSize),
                                                    markType.create(newAttrs),
                                                );
                                            });
                                            editor.view.dispatch(tr);
                                        }
                                        editor.chain().setColor(val).run();
                                        originalColorRef.current = null;
                                        isPickingColorRef.current = false;
                                        onColorPickerToggle?.(false);
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
                    document.body,
                )}
        </div>
    );
};

export default ColorPalette;
