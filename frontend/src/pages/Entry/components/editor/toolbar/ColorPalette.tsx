import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Palette } from 'lucide-react';
import classNames from 'classnames';
import { type ColorPaletteProps } from '../../../../../types';
import { type Transaction } from '@tiptap/pm/state';
import { PRESET_COLORS } from '../../../../../utils/constants';
import styles from './ColorPalette.module.css';

const rgbToHex = (color: string) => {
    if (!color || typeof color !== 'string') return '#493627';
    if (color.startsWith('#')) return color;
    const match = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)$/);
    if (!match) return color;
    const [r, g, b] = [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
};

const ColorPalette = ({ editor, isDragMode, onColorPickerToggle }: ColorPaletteProps) => {
    const [currentColor, setCurrentColor] = useState('#493627');
    const [documentColors, setDocumentColors] = useState<string[]>([]);
    const [showPalette, setShowPalette] = useState(false);
    const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

    const isPickingColorRef = useRef(false);
    const paletteRef = useRef<HTMLDivElement>(null);
    const originalColorRef = useRef<string | null>(null);
    const lastPreviewTimeRef = useRef<number>(0);

    useEffect(() => {
        if (!editor) return;

        const updateDocumentColors = () => {
            const colors = new Set<string>();
            editor.state.doc.descendants((node) => {
                node.marks?.forEach((mark) => {
                    if (mark.type.name === 'textStyle' && mark.attrs.color) colors.add(mark.attrs.color.toLowerCase());
                });
                return true;
            });
            setDocumentColors(
                Array.from(colors)
                    .reverse()
                    .filter((c) => !PRESET_COLORS.some((p) => p.toLowerCase() === c.toLowerCase()))
                    .slice(0, 10),
            );
        };

        const updateState = (props?: { transaction?: Transaction }) => {
            if (isPickingColorRef.current) return;

            const color = editor.getAttributes('textStyle').color || rgbToHex(window.getComputedStyle(editor.view.dom).color);
            setCurrentColor(color);
            if (!props?.transaction?.getMeta('isColorPreview')) updateDocumentColors();
        };

        const handleFocus = () => {
            isPickingColorRef.current = false;
            onColorPickerToggle?.(false);
        };

        editor.on('selectionUpdate', updateState).on('transaction', updateState).on('focus', handleFocus);
        return () => {
            editor.off('selectionUpdate', updateState).off('transaction', updateState).off('focus', handleFocus);
        };
    }, [editor, onColorPickerToggle]);

    useEffect(() => {
        if (!showPalette) return;

        const updatePos = () => paletteRef.current && setAnchorRect(paletteRef.current.getBoundingClientRect());
        updatePos();

        const handleGlobalClick = (e: MouseEvent) => {
            if (paletteRef.current && !paletteRef.current.contains(e.target as HTMLElement)) {
                setShowPalette(false);
                isPickingColorRef.current = false;
                onColorPickerToggle?.(false);
            }
        };

        document.addEventListener('mousedown', handleGlobalClick);
        window.addEventListener('resize', updatePos);
        return () => {
            document.removeEventListener('mousedown', handleGlobalClick);
            window.removeEventListener('resize', updatePos);
        };
    }, [showPalette, onColorPickerToggle]);

    const applyColor = (color: string) => {
        setCurrentColor(color);
        editor.chain().setColor(color).setTextSelection(editor.state.selection.to).blur().run();
        setShowPalette(false);
        isPickingColorRef.current = false;
        onColorPickerToggle?.(false);
    };

    const updateColorPreview = (val: string, isFinal = false) => {
        setCurrentColor(val);
        const now = Date.now();
        if (isFinal || now - lastPreviewTimeRef.current > 32) {
            lastPreviewTimeRef.current = now;
            const { from, to } = editor.state.selection;
            const tr = editor.state.tr.setMeta('addToHistory', false).setMeta('isColorPreview', !isFinal);
            const markType = editor.schema.marks.textStyle;

            editor.state.doc.nodesBetween(from, to, (node, pos) => {
                if (!node.isText) return;

                const existingMark = node.marks.find((m) => m.type === markType);
                tr.addMark(
                    Math.max(from, pos),
                    Math.min(to, pos + node.nodeSize),
                    markType.create({ ...existingMark?.attrs, color: isFinal ? val : val }),
                );
            });
            editor.view.dispatch(tr);
            if (isFinal) {
                editor.chain().setColor(val).setTextSelection(to).blur().run();
                originalColorRef.current = null;
                isPickingColorRef.current = false;
                onColorPickerToggle?.(false);
            }
        }
    };

    const renderColorGrid = (label: string, colors: string[]) =>
        colors.length > 0 && (
            <div className={styles.paletteSection}>
                <div className={styles.paletteLabel}>{label}</div>
                <div className={styles.colorGrid}>
                    {colors.map((color) => (
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
        );

    return (
        <div className={styles.paletteContainer} ref={paletteRef}>
            <button
                type="button"
                disabled={isDragMode}
                title="Color Palette"
                className={classNames(styles.actionButton, { [styles.isActive]: showPalette })}
                onClick={(e) => {
                    e.stopPropagation();
                    setShowPalette(!showPalette);
                }}
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
                        {renderColorGrid('Document colors', documentColors)}

                        {documentColors.length > 0 && <div className={styles.paletteDivider} />}

                        {renderColorGrid('Preset Colors', PRESET_COLORS)}
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
                                        editor.commands.blur();
                                    }}
                                    onInput={(e) => updateColorPreview(e.currentTarget.value)}
                                    onChange={(e) => updateColorPreview(e.currentTarget.value, true)}
                                    onClick={() => {
                                        isPickingColorRef.current = true;
                                        originalColorRef.current = editor.getAttributes('textStyle').color || '#493627';
                                        onColorPickerToggle?.(true);
                                        editor.commands.blur();
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
