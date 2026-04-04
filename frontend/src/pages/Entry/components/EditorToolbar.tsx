import { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
    Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
    AlignJustify, Image as ImageIcon, Undo, Redo, List, ListOrdered,
    Hand, Palette, Settings, ChevronLeft, ChevronRight
} from 'lucide-react';
import classNames from 'classnames';
import { type EditorToolbarProps } from '../../../types';
import styles from './EditorToolbar.module.css';

const EditorToolbar = ({
    editor,
    isDragMode = false,
    onToggleDragMode,
    onColorPickerToggle,
    pageSettings,
    onPageSettingsChange
}: EditorToolbarProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [currentFont, setCurrentFont] = useState("'Kaushan Script'");
    const [currentSize, setCurrentSize] = useState('16px');
    const [currentColor, setCurrentColor] = useState('#493627');
    const [currentAlign, setCurrentAlign] = useState('left');
    const [recentColors, setRecentColors] = useState<string[]>([]);
    const [showPalette, setShowPalette] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const isPickingColorRef = useRef(false);
    const paletteRef = useRef<HTMLDivElement>(null);
    const settingsRef = useRef<HTMLDivElement>(null);
    const bgInputRef = useRef<HTMLInputElement>(null);
    const lastPreviewTimeRef = useRef<number>(0);
    const originalColorRef = useRef<string | null>(null);
    const [, forceUpdate] = useState({});
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);

    const presetColors = [
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

    // Update toolbar state
    useEffect(() => {
        if (!editor) return;

        // recent colors (last 10)
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

            setRecentColors(combined.filter(c => !presetColors.includes(c.toUpperCase()) && !presetColors.includes(c.toLowerCase())).slice(0, 10));
        };

        // updating the toolbar state
        const updateState = () => {
            if (isPickingColorRef.current) return;

            try {
                // Use Tiptap's built-in attribute detection which is more reliable than getComputedStyle
                let attrs = editor.getAttributes('textStyle');

                // If selection has mixed fonts, getAttributes might return empty. 
                // Fallback to the font at the start of selection for better UX.
                if (!attrs.fontFamily && !editor.state.selection.empty) {
                    const { from } = editor.state.selection;
                    const node = editor.state.doc.nodeAt(from);
                    if (node && node.marks) {
                        const styleMark = node.marks.find(m => m.type.name === 'textStyle');
                        if (styleMark && styleMark.attrs.fontFamily) {
                            attrs = { ...attrs, fontFamily: styleMark.attrs.fontFamily };
                        }
                    }
                }

                // Font Family
                if (attrs.fontFamily) {
                    const family = attrs.fontFamily.replace(/['"]/g, '').trim();
                    const presets = [
                        "Kaushan Script", "Odor Mean Chey", "Dancing Script", "Pacifico", "Caveat", "Indie Flower", "Shadows Into Light",
                        "Playfair Display", "Merriweather", "Lora", "Cormorant Garamond", "Gurajada",
                        "Inter", "Roboto", "Open Sans", "Montserrat", "Lato", "Poppins", "Gudea",
                        "Bebas Neue", "Lobster", "Abril Fatface", "Righteous", "Comfortaa",
                        "Fira Code", "JetBrains Mono", "Space Mono",
                        "Special Elite", "Courier Prime"
                    ];
                    // Find the matching preset value (which might be quoted in the select values)
                    const match = presets.find(p => family === p || family.includes(p) || p.includes(family));
                    if (match) {
                        // If the preset has spaces, our select values use single quotes
                        const selectVal = match.includes(' ') ? `'${match}'` : match;
                        setCurrentFont(selectVal);
                    } else {
                        setCurrentFont(family);
                    }
                } else {
                    // Kaushan Script is the base font of the editor
                    setCurrentFont("'Kaushan Script'");
                }

                // Color
                const focusedElement = editor.view.dom.querySelector('.ProseMirror-focused');
                if (attrs.color) {
                    setCurrentColor(attrs.color);
                } else if (focusedElement) {
                    // Fallback to computed if no attribute is set (default color)
                    const style = window.getComputedStyle(focusedElement);
                    setCurrentColor(rgbToHex(style.color));
                }

                // Font Size
                if (attrs.fontSize) {
                    setCurrentSize(attrs.fontSize);
                } else {
                    // If no explicit font size attribute, determine size based on block type
                    if (editor.isActive('heading', { level: 1 })) setCurrentSize('36px');
                    else if (editor.isActive('heading', { level: 2 })) setCurrentSize('30px');
                    else if (editor.isActive('heading', { level: 3 })) setCurrentSize('24px');
                    else setCurrentSize('16px');
                }

                // Alignment
                if (editor.isActive({ textAlign: 'center' })) setCurrentAlign('center');
                else if (editor.isActive({ textAlign: 'right' })) setCurrentAlign('right');
                else if (editor.isActive({ textAlign: 'justify' })) setCurrentAlign('justify');
                else setCurrentAlign('left');

            } catch (err) {
                // Silently handle toolbar state extraction errors
                console.warn('Toolbar update error:', err);
            }

            updateRecentColors();
            forceUpdate({});
        };

        // close modals when clicking outside
        const handleGlobalClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;

            if (paletteRef.current && !paletteRef.current.contains(target)) {
                setShowPalette(false);
                isPickingColorRef.current = false;
                onColorPickerToggle?.(false);
            }
            if (settingsRef.current && !settingsRef.current.contains(target)) {
                setShowSettings(false);
            }
        };

        const handleFocus = () => { // avoid stuck color picker state
            isPickingColorRef.current = false;
            onColorPickerToggle?.(false);
        };

        document.addEventListener('mousedown', handleGlobalClick);
        editor.on('selectionUpdate', updateState);
        editor.on('transaction', updateState);
        editor.on('update', updateState);
        editor.on('focus', handleFocus);

        return () => {
            document.removeEventListener('mousedown', handleGlobalClick);
            editor.off('selectionUpdate', updateState);
            editor.off('transaction', updateState);
            editor.off('update', updateState);
            editor.off('focus', handleFocus);
        };
    }, [editor, showPalette, onColorPickerToggle]);

    const checkScroll = () => {
        const container = scrollContainerRef.current;
        if (container) {
            const { scrollLeft, scrollWidth, clientWidth } = container;
            setShowLeftArrow(scrollLeft > 5);
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5);
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);

        let observer: ResizeObserver;
        if (scrollContainerRef.current) {
            observer = new ResizeObserver(() => checkScroll());
            observer.observe(scrollContainerRef.current);
        }

        return () => {
            window.removeEventListener('resize', checkScroll);
            if (observer) observer.disconnect();
        };
    }, [editor]);

    const scroll = (direction: 'left' | 'right') => {
        const container = scrollContainerRef.current;
        if (container) {
            const scrollAmount = 200;
            container.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    if (!editor) return null;

    // Apply preset color
    const applyColor = (color: string) => {
        setCurrentColor(color);
        editor.chain().setColor(color).run();

        setShowPalette(false);
        isPickingColorRef.current = false;
        onColorPickerToggle?.(false);
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                (editor.chain() as any).setImage({ src: result }).run();
            };
            reader.readAsDataURL(file);
            event.target.value = '';
        }
    };

    return (
        <div className={styles.toolbarWrapper}>
            {showLeftArrow && (
                <button type="button" className={styles.scrollArrow} onClick={() => scroll('left')}>
                    <ChevronLeft size={16} />
                </button>
            )}

            <div
                ref={scrollContainerRef}
                className={styles.scrollContainer}
                onScroll={checkScroll}
            >
                <div className={styles.toolbarGroup}>
                    <button
                        type="button"
                        onClick={() => editor.chain().undo().run()}
                        disabled={isDragMode || !editor.can().chain().undo().run()}
                        className={styles.actionButton}
                        title="Undo"
                    >
                        <Undo size={18} />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().redo().run()}
                        disabled={isDragMode || !editor.can().chain().redo().run()}
                        className={styles.actionButton}
                        title="Redo"
                    >
                        <Redo size={18} />
                    </button>
                </div>

                <div className={styles.divider} />

                <div className={classNames(styles.toolbarGroup, styles.dropdownGroup)}>
                    <select
                        className={styles.dropdownSelect}
                        disabled={isDragMode}
                        value={
                            editor.isActive('heading', { level: 1 }) ? 'h1' :
                                editor.isActive('heading', { level: 2 }) ? 'h2' :
                                    editor.isActive('heading', { level: 3 }) ? 'h3' :
                                        'p'
                        }
                        onChange={(e) => {
                            const val = e.target.value;
                            let newSize = '16px';
                            if (val === 'h1') newSize = '36px';
                            if (val === 'h2') newSize = '30px';
                            if (val === 'h3') newSize = '24px';

                            setCurrentSize(newSize);

                            const { $from, $to } = editor.state.selection;
                            let chain = editor.chain().focus();

                            if ($from.pos === $to.pos && $from.sameParent($to)) {
                                chain = chain
                                    .setTextSelection({ from: $from.start(), to: $from.end() })
                                    .setFontSize(newSize)
                                    .setTextSelection({ from: $from.pos, to: $to.pos });
                            } else {
                                chain = chain.setFontSize(newSize);
                            }

                            if (val === 'p') {
                                chain.setParagraph().setTextAlign(currentAlign).run();
                            } else {
                                const level = parseInt(val.substring(1)) as 1 | 2 | 3;
                                chain.setHeading({ level }).setTextAlign(currentAlign).run();
                            }
                        }}
                    >
                        <option value="p">Normal Text</option>
                        <option value="h1">Heading 1</option>
                        <option value="h2">Heading 2</option>
                        <option value="h3">Heading 3</option>
                    </select>

                    <select
                        className={styles.dropdownSelect}
                        disabled={isDragMode}
                        value={currentFont}
                        onChange={(e) => {
                            const val = e.target.value;
                            setCurrentFont(val);
                            editor.chain().setFontFamily(val).run();
                        }}
                    >
                        <option value="'Kaushan Script'">Kaushan Script</option>
                        <option value="'Odor Mean Chey'">Odor Mean Chey</option>
                        <option value="'Dancing Script'">Dancing Script</option>
                        <option value="Pacifico">Pacifico</option>
                        <option value="Caveat">Caveat</option>
                        <option value="'Indie Flower'">Indie Flower</option>
                        <option value="'Shadows Into Light'">Shadows Into Light</option>
                        <option value="'Playfair Display'">Playfair Display</option>
                        <option value="Merriweather">Merriweather</option>
                        <option value="Lora">Lora</option>
                        <option value="'Cormorant Garamond'">Cormorant Garamond</option>
                        <option value="Gurajada">Gurajada</option>
                        <option value="Inter">Inter (Sans)</option>
                        <option value="Roboto">Roboto</option>
                        <option value="'Open Sans'">Open Sans</option>
                        <option value="Montserrat">Montserrat</option>
                        <option value="Lato">Lato</option>
                        <option value="Poppins">Poppins</option>
                        <option value="Gudea">Gudea</option>
                        <option value="'Bebas Neue'">Bebas Neue</option>
                        <option value="Lobster">Lobster</option>
                        <option value="'Abril Fatface'">Abril Fatface</option>
                        <option value="Righteous">Righteous</option>
                        <option value="Comfortaa">Comfortaa</option>
                        <option value="'Fira Code'">Fira Code</option>
                        <option value="'JetBrains Mono'">JetBrains Mono</option>
                        <option value="'Space Mono'">Space Mono</option>
                        <option value="'Special Elite'">Special Elite</option>
                        <option value="'Courier Prime'">Courier Prime</option>
                    </select>

                    <select
                        className={classNames(styles.dropdownSelect, styles.sizeSelect)}
                        disabled={isDragMode}
                        value={currentSize}
                        onChange={(e) => {
                            const val = e.target.value;
                            setCurrentSize(val);
                            editor.chain().focus().setFontSize(val).setTextAlign(currentAlign).run();
                        }}
                    >
                        {![
                            '12px', '14px', '16px', '18px', '20px', '24px', '30px', '36px', '48px', '64px', '72px'
                        ].includes(currentSize) && (
                                <option value={currentSize}>{currentSize}</option>
                            )}
                        <option value="12px">12px</option>
                        <option value="14px">14px</option>
                        <option value="16px">16px</option>
                        <option value="18px">18px</option>
                        <option value="20px">20px</option>
                        <option value="24px">24px</option>
                        <option value="30px">30px</option>
                        <option value="36px">36px</option>
                        <option value="48px">48px</option>
                        <option value="64px">64px</option>
                        <option value="72px">72px</option>
                    </select>
                </div>

                <div className={styles.divider} />

                <div className={styles.toolbarGroup}>
                    <div className={styles.paletteContainer} ref={paletteRef}>
                        <button
                            type="button"
                            disabled={isDragMode}
                            className={classNames(styles.actionButton, styles.paletteTrigger, { [styles.isActive]: showPalette })}
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
                                        {presetColors.map((color) => (
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

                    <div className={styles.divider} />

                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        disabled={isDragMode || !editor.can().chain().focus().toggleBold().run()}
                        className={classNames(styles.actionButton, { [styles.isActive]: editor.isActive('bold') })}
                        title="Bold"
                    >
                        <Bold size={18} />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        disabled={isDragMode || !editor.can().chain().focus().toggleItalic().run()}
                        className={classNames(styles.actionButton, { [styles.isActive]: editor.isActive('italic') })}
                        title="Italic"
                    >
                        <Italic size={18} />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        disabled={isDragMode || !editor.can().chain().focus().toggleUnderline().run()}
                        className={classNames(styles.actionButton, { [styles.isActive]: editor.isActive('underline') })}
                        title="Underline"
                    >
                        <Underline size={18} />
                    </button>
                </div>

                <div className={styles.divider} />

                <div className={styles.toolbarGroup}>
                    <button
                        type="button"
                        disabled={isDragMode}
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                        className={classNames(styles.actionButton, { [styles.isActive]: currentAlign === 'left' })}
                    >
                        <AlignLeft size={18} />
                    </button>
                    <button
                        type="button"
                        disabled={isDragMode}
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                        className={classNames(styles.actionButton, { [styles.isActive]: currentAlign === 'center' })}
                    >
                        <AlignCenter size={18} />
                    </button>
                    <button
                        type="button"
                        disabled={isDragMode}
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                        className={classNames(styles.actionButton, { [styles.isActive]: currentAlign === 'right' })}
                    >
                        <AlignRight size={18} />
                    </button>
                    <button
                        type="button"
                        disabled={isDragMode}
                        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                        className={classNames(styles.actionButton, { [styles.isActive]: currentAlign === 'justify' })}
                    >
                        <AlignJustify size={18} />
                    </button>
                </div>

                <div className={styles.divider} />

                <div className={styles.toolbarGroup}>
                    <button
                        type="button"
                        disabled={isDragMode}
                        onClick={() => {
                            editor.chain().focus().toggleBulletList().run();
                            if (editor.isActive('bulletList') && currentSize !== '16px') {
                                editor.chain().focus().updateAttributes('listItem', { fontSize: currentSize }).run();
                            }
                        }}
                        className={classNames(styles.actionButton, { [styles.isActive]: editor.isActive('bulletList') })}
                    >
                        <List size={18} />
                    </button>
                    <button
                        type="button"
                        disabled={isDragMode}
                        onClick={() => {
                            editor.chain().focus().toggleOrderedList().run();
                            if (editor.isActive('orderedList') && currentSize !== '16px') {
                                editor.chain().focus().updateAttributes('listItem', { fontSize: currentSize }).run();
                            }
                        }}
                        className={classNames(styles.actionButton, { [styles.isActive]: editor.isActive('orderedList') })}
                    >
                        <ListOrdered size={18} />
                    </button>
                </div>

                <div className={styles.divider} />

                <div className={styles.toolbarGroup}>
                    <button
                        type="button"
                        className={styles.actionButton}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isDragMode}
                    >
                        <ImageIcon size={18} />
                    </button>
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                    />
                </div>

                <div className={styles.divider} />

                <div className={styles.settingsContainer} ref={settingsRef}>
                    <button
                        type="button"
                        disabled={isDragMode}
                        className={classNames(styles.actionButton, styles.settingsTrigger, { [styles.isActive]: showSettings })}
                        onClick={() => setShowSettings(!showSettings)}
                        title="Page Settings"
                    >
                        <Settings size={18} />
                    </button>

                    {showSettings && pageSettings && onPageSettingsChange && createPortal(
                        <div
                            className={styles.settingsPopup}
                            onMouseDown={(e) => e.stopPropagation()}
                            style={{
                                position: 'fixed',
                                bottom: `${window.innerHeight - (settingsRef.current?.getBoundingClientRect().top ?? 0) + 8}px`,
                                left: `${(settingsRef.current?.getBoundingClientRect().left ?? 0) + ((settingsRef.current?.getBoundingClientRect().width ?? 0) / 2)}px`,
                                transform: 'translateX(-50%)',
                                zIndex: 10000
                            }}
                        >
                            <div className={styles.settingsSection}>
                                <div className={styles.settingsLabel}>Background Image</div>
                                <div className={styles.bgActions}>
                                    <button type="button" className={styles.btnSm} onClick={() => bgInputRef.current?.click()}>Upload</button>
                                    <button type="button" className={styles.btnSm} onClick={() => onPageSettingsChange({ ...pageSettings, backgroundUrl: null })}>Clear</button>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={bgInputRef}
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onload = (ev) => {
                                                const result = ev.target?.result as string;
                                                onPageSettingsChange({ ...pageSettings, backgroundUrl: result });
                                            };
                                            reader.readAsDataURL(file);
                                            e.target.value = '';
                                        }
                                    }}
                                    style={{ display: 'none' }}
                                />
                            </div>

                            <div className={styles.settingsDivider} />

                            <div className={styles.settingsSection}>
                                <div className={styles.settingsLabel}>Page Margins (px)</div>
                                <div className={styles.marginsGrid}>
                                    <label className={styles.marginInput}>
                                        <span>Top</span>
                                        <input type="number" min="0" value={pageSettings.paddingTop} onChange={(e) => onPageSettingsChange({ ...pageSettings, paddingTop: Number(e.target.value) })} />
                                    </label>
                                    <label className={styles.marginInput}>
                                        <span>Bottom</span>
                                        <input type="number" min="0" value={pageSettings.paddingBottom} onChange={(e) => onPageSettingsChange({ ...pageSettings, paddingBottom: Number(e.target.value) })} />
                                    </label>
                                    <label className={styles.marginInput}>
                                        <span>Left</span>
                                        <input type="number" min="0" value={pageSettings.paddingLeft} onChange={(e) => onPageSettingsChange({ ...pageSettings, paddingLeft: Number(e.target.value) })} />
                                    </label>
                                    <label className={styles.marginInput}>
                                        <span>Right</span>
                                        <input type="number" min="0" value={pageSettings.paddingRight} onChange={(e) => onPageSettingsChange({ ...pageSettings, paddingRight: Number(e.target.value) })} />
                                    </label>
                                </div>
                            </div>
                        </div>,
                        document.body
                    )}
                </div>

                <div className={styles.divider} />

                <div className={styles.toolbarGroup}>
                    <button
                        type="button"
                        onClick={onToggleDragMode}
                        className={classNames(styles.actionButton, { [styles.isActive]: isDragMode })}
                        title="Drag Tool"
                    >
                        <Hand size={18} />
                    </button>
                </div>
            </div>

            {showRightArrow && (
                <button type="button" className={styles.scrollArrow} onClick={() => scroll('right')}>
                    <ChevronRight size={16} />
                </button>
            )}
        </div>
    );
};

export default EditorToolbar;
