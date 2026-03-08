import { Editor } from '@tiptap/react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, Image as ImageIcon, Undo, Redo, List, ListOrdered, Hand, Palette, Settings } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import styles from './EditorToolbar.module.css';
import classNames from 'classnames';
import type { PageSettings } from './EntryEditor';

interface EditorToolbarProps {
    editor: Editor | null;
    titleEditor?: Editor | null;
    contentEditor?: Editor | null;
    isDragMode?: boolean;
    onToggleDragMode?: () => void;
    onColorPickerToggle?: (active: boolean) => void;
    pageSettings?: PageSettings;
    onPageSettingsChange?: (settings: PageSettings) => void;
}

const EditorToolbar = ({
    editor,
    titleEditor,
    contentEditor,
    isDragMode = false,
    onToggleDragMode,
    onColorPickerToggle,
    pageSettings,
    onPageSettingsChange
}: EditorToolbarProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [currentFont, setCurrentFont] = useState("'Kaushan Script', cursive");
    const [currentSize, setCurrentSize] = useState('16px');
    const [currentColor, setCurrentColor] = useState('#493627');
    const [recentColors, setRecentColors] = useState<string[]>([]);
    const [showPalette, setShowPalette] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const isPickingColorRef = useRef(false);
    const paletteRef = useRef<HTMLDivElement>(null);
    const settingsRef = useRef<HTMLDivElement>(null);
    const bgInputRef = useRef<HTMLInputElement>(null);
    const [, forceUpdate] = useState({});

    const presetColors = [
        '#493627', '#E4E0E1', '#D6C0B3', '#AB886D',
        '#2C3E50', '#E74C3C', '#27AE60', '#F1C40F',
        '#8E44AD', '#3498DB', '#16A085', '#D35400',
        '#FFC0CB', '#B0C4DE', '#98FB98', '#FFFACD'
    ];

    useEffect(() => {
        if (!editor) return;

        const updateRecentColors = () => {
            const colors = new Set<string>();
            const scanEditor = (ed: Editor | null | undefined) => {
                if (!ed) return;
                ed.state.doc.descendants((node) => {
                    if (node.marks) {
                        node.marks.forEach((mark) => {
                            if (mark.type.name === 'textStyle' && mark.attrs.color) {
                                colors.add(mark.attrs.color.toLowerCase());
                            }
                        });
                    }
                    return true;
                });
            };

            if (titleEditor || contentEditor) {
                scanEditor(titleEditor);
                scanEditor(contentEditor);
            } else {
                scanEditor(editor);
            }
            const combined = Array.from(colors).reverse();

            setRecentColors(combined.filter(c => !presetColors.includes(c.toUpperCase()) && !presetColors.includes(c.toLowerCase())).slice(0, 10));
        };

        const updateState = () => {
            const attrs = editor.getAttributes('textStyle');
            setCurrentFont(attrs.fontFamily || "'Kaushan Script', cursive");
            setCurrentColor(attrs.color || '#493627');

            let size = attrs.fontSize;
            if (!size) {
                size = '16px';
            }
            setCurrentSize(size);
            updateRecentColors();
            forceUpdate({});
        };

        const handleGlobalClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;

            if (paletteRef.current && !paletteRef.current.contains(target) && !target.closest(`.${styles.paletteTrigger}`)) {
                setShowPalette(false);
                isPickingColorRef.current = false;
                onColorPickerToggle?.(false);
            }

            if (settingsRef.current && !settingsRef.current.contains(target) && !target.closest(`.${styles.settingsTrigger}`)) {
                setShowSettings(false);
            }

            if (isPickingColorRef.current && !target.closest(`.${styles.colorPicker}`)) {
                isPickingColorRef.current = false;
                onColorPickerToggle?.(false);
            }
        };

        const handleFocus = () => {
            isPickingColorRef.current = false;
            onColorPickerToggle?.(false);
        };

        document.addEventListener('mousedown', handleGlobalClick);
        editor.on('selectionUpdate', updateState);
        editor.on('transaction', updateState);
        editor.on('focus', handleFocus);

        return () => {
            document.removeEventListener('mousedown', handleGlobalClick);
            editor.off('selectionUpdate', updateState);
            editor.off('transaction', updateState);
            editor.off('focus', handleFocus);
        };
    }, [editor, titleEditor, contentEditor, onColorPickerToggle]);

    const applyColor = (color: string) => {
        if (!editor) return;
        setCurrentColor(color);
        editor.chain().focus().setColor(color).run();

        setShowPalette(false);
        isPickingColorRef.current = false;
        onColorPickerToggle?.(false);
    };

    if (!editor) {
        return (
            <div className={styles.toolbarWrapper}>
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
        );
    }

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                (editor.chain().focus() as any).setImage({ src: result }).run();
            };
            reader.readAsDataURL(file);
            event.target.value = '';
        }
    };

    return (
        <div className={styles.toolbarWrapper}>
            <div className={styles.toolbarGroup}>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={isDragMode || !editor.can().chain().focus().undo().run()}
                    className={styles.actionButton}
                    title="Undo"
                >
                    <Undo size={18} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={isDragMode || !editor.can().chain().focus().redo().run()}
                    className={styles.actionButton}
                    title="Redo"
                >
                    <Redo size={18} />
                </button>
            </div>

            <div className={styles.divider} />

            <div className={styles.toolbarGroup}>
                <select
                    className={styles.dropdownSelect}
                    disabled={isDragMode}
                    value={
                        currentSize === '36px' ? 'h1' :
                            currentSize === '30px' ? 'h2' :
                                currentSize === '24px' ? 'h3' :
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

                        chain.setParagraph().run();
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
                        editor.chain().focus().setFontFamily(val).run();
                    }}
                >
                    <option value="'Kaushan Script', cursive">Kaushan Script</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="'Odor Mean Chey', cursive">Odor Mean Chey</option>
                    <option value="'Gurajada', serif">Gurajada</option>
                    <option value="'Gudea', sans-serif">Gudea</option>
                </select>

                <select
                    className={classNames(styles.dropdownSelect, styles.sizeSelect)}
                    disabled={isDragMode}
                    value={currentSize}
                    onChange={(e) => {
                        const val = e.target.value;
                        setCurrentSize(val);
                        editor.chain().focus().setFontSize(val).run();
                    }}
                >
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

                <div className={styles.divider} />

                <div className={styles.paletteContainer} ref={paletteRef}>
                    <button
                        type="button"
                        disabled={isDragMode}
                        className={classNames(styles.actionButton, styles.paletteTrigger, { [styles.isActive]: showPalette })}
                        onClick={() => {
                            setShowPalette(!showPalette);
                        }}
                        title="Color Palette"
                    >
                        <Palette size={18} />
                    </button>

                    {showPalette && (
                        <div className={styles.palettePopup}>
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
                                        onFocus={() => {
                                            isPickingColorRef.current = true;
                                            onColorPickerToggle?.(true);
                                        }}
                                        onInput={(e) => {
                                            const val = (e.target as HTMLInputElement).value;
                                            setCurrentColor(val);
                                            editor.chain().setColor(val).run();
                                        }}
                                        onClick={() => {
                                            isPickingColorRef.current = true;
                                            onColorPickerToggle?.(true);
                                        }}
                                    />
                                    <span className={styles.colorHex}>{currentColor.toUpperCase()}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.divider} />

            <div className={styles.toolbarGroup}>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    disabled={isDragMode || !editor.can().chain().focus().toggleBold().run()}
                    className={classNames(styles.actionButton, { [styles.isActive]: editor.isActive('bold') })}
                >
                    <Bold size={18} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    disabled={isDragMode || !editor.can().chain().focus().toggleItalic().run()}
                    className={classNames(styles.actionButton, { [styles.isActive]: editor.isActive('italic') })}
                >
                    <Italic size={18} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    disabled={isDragMode || !editor.can().chain().focus().toggleUnderline().run()}
                    className={classNames(styles.actionButton, { [styles.isActive]: editor.isActive('underline') })}
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
                    className={classNames(styles.actionButton, { [styles.isActive]: editor.isActive({ textAlign: 'left' }) })}
                >
                    <AlignLeft size={18} />
                </button>
                <button
                    type="button"
                    disabled={isDragMode}
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    className={classNames(styles.actionButton, { [styles.isActive]: editor.isActive({ textAlign: 'center' }) })}
                >
                    <AlignCenter size={18} />
                </button>
                <button
                    type="button"
                    disabled={isDragMode}
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    className={classNames(styles.actionButton, { [styles.isActive]: editor.isActive({ textAlign: 'right' }) })}
                >
                    <AlignRight size={18} />
                </button>
                <button
                    type="button"
                    disabled={isDragMode}
                    onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                    className={classNames(styles.actionButton, { [styles.isActive]: editor.isActive({ textAlign: 'justify' }) })}
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

                {showSettings && pageSettings && onPageSettingsChange && (
                    <div className={styles.settingsPopup}>
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
                    </div>
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
    );
};

export default EditorToolbar;
