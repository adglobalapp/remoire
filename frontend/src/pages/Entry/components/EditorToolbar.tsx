import { Editor } from '@tiptap/react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, Image as ImageIcon, Undo, Redo, List, ListOrdered, Hand } from 'lucide-react';
import { useRef, useEffect, useState } from 'react';
import styles from './EditorToolbar.module.css';
import classNames from 'classnames';

interface EditorToolbarProps {
    editor: Editor | null;
    isDragMode?: boolean;
    onToggleDragMode?: () => void;
}

const EditorToolbar = ({
    editor,
    isDragMode = false,
    onToggleDragMode
}: EditorToolbarProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [currentFont, setCurrentFont] = useState("'Kaushan Script', cursive");
    const [currentSize, setCurrentSize] = useState('16px');
    const [currentColor, setCurrentColor] = useState('#493627');
    const [, forceUpdate] = useState({});

    useEffect(() => {
        if (!editor) return;

        const updateState = () => {
            const attrs = editor.getAttributes('textStyle');
            setCurrentFont(attrs.fontFamily || "'Kaushan Script', cursive");
            setCurrentColor(attrs.color || '#493627');

            let size = attrs.fontSize;
            if (!size) {
                if (editor.isActive('heading', { level: 1 })) size = '64px';
                else if (editor.isActive('heading', { level: 2 })) size = '36px';
                else if (editor.isActive('heading', { level: 3 })) size = '24px';
                else size = '16px';
            }
            setCurrentSize(size);
            forceUpdate({});
        };

        editor.on('selectionUpdate', updateState);
        editor.on('transaction', updateState);

        return () => {
            editor.off('selectionUpdate', updateState);
            editor.off('transaction', updateState);
        };
    }, [editor]);

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
                    className={styles.actionButton}
                    title="Undo"
                >
                    <Undo size={18} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().redo().run()}
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
                    value={
                        editor.isActive('heading', { level: 1 }) ? 'h1' :
                            editor.isActive('heading', { level: 2 }) ? 'h2' :
                                editor.isActive('heading', { level: 3 }) ? 'h3' :
                                    'p'
                    }
                    onChange={(e) => {
                        const val = e.target.value;
                        let newSize = '16px';
                        if (val === 'h1') newSize = '64px';
                        if (val === 'h2') newSize = '36px';
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
                            chain.setParagraph().run();
                        } else {
                            const level = parseInt(val.charAt(1)) as 1 | 2 | 3;
                            chain.setHeading({ level }).run();
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

                <div className={styles.actionButton} title="Font Color">
                    <input
                        type="color"
                        className={styles.colorPicker}
                        value={currentColor}
                        onChange={(e) => {
                            const val = e.target.value;
                            setCurrentColor(val);
                            editor.chain().focus().setColor(val).run();
                        }}
                    />
                </div>
            </div>

            <div className={styles.divider} />

            <div className={styles.toolbarGroup}>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    disabled={!editor.can().chain().focus().toggleBold().run()}
                    className={classNames(styles.actionButton, { [styles.isActive]: editor.isActive('bold') })}
                >
                    <Bold size={18} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    disabled={!editor.can().chain().focus().toggleItalic().run()}
                    className={classNames(styles.actionButton, { [styles.isActive]: editor.isActive('italic') })}
                >
                    <Italic size={18} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    disabled={!editor.can().chain().focus().toggleUnderline().run()}
                    className={classNames(styles.actionButton, { [styles.isActive]: editor.isActive('underline') })}
                >
                    <Underline size={18} />
                </button>
            </div>

            <div className={styles.divider} />

            <div className={styles.toolbarGroup}>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    className={classNames(styles.actionButton, { [styles.isActive]: editor.isActive({ textAlign: 'left' }) })}
                >
                    <AlignLeft size={18} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    className={classNames(styles.actionButton, { [styles.isActive]: editor.isActive({ textAlign: 'center' }) })}
                >
                    <AlignCenter size={18} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    className={classNames(styles.actionButton, { [styles.isActive]: editor.isActive({ textAlign: 'right' }) })}
                >
                    <AlignRight size={18} />
                </button>
                <button
                    type="button"
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
                <button type="button" className={styles.actionButton} onClick={() => fileInputRef.current?.click()}>
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
