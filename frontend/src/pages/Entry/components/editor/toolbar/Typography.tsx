import { useState, useEffect } from 'react';
import classNames from 'classnames';
import { type Editor } from '@tiptap/react';
import styles from './Typography.module.css';

interface TypographyProps {
    editor: Editor;
    isDragMode: boolean;
}

const FONTS = [
    { value: "'Kaushan Script'", label: "Kaushan Script" },
    { value: "'Odor Mean Chey'", label: "Odor Mean Chey" },
    { value: "'Dancing Script'", label: "Dancing Script" },
    { value: "Pacifico", label: "Pacifico" },
    { value: "Caveat", label: "Caveat" },
    { value: "'Indie Flower'", label: "Indie Flower" },
    { value: "'Shadows Into Light'", label: "Shadows Into Light" },
    { value: "'Playfair Display'", label: "Playfair Display" },
    { value: "Merriweather", label: "Merriweather" },
    { value: "Lora", label: "Lora" },
    { value: "'Cormorant Garamond'", label: "Cormorant Garamond" },
    { value: "Gurajada", label: "Gurajada" },
    { value: "Inter", label: "Inter (Sans)" },
    { value: "Roboto", label: "Roboto" },
    { value: "'Open Sans'", label: "Open Sans" },
    { value: "Montserrat", label: "Montserrat" },
    { value: "Lato", label: "Lato" },
    { value: "Poppins", label: "Poppins" },
    { value: "Gudea", label: "Gudea" },
    { value: "'Bebas Neue'", label: "Bebas Neue" },
    { value: "Lobster", label: "Lobster" },
    { value: "'Abril Fatface'", label: "Abril Fatface" },
    { value: "Righteous", label: "Righteous" },
    { value: "Comfortaa", label: "Comfortaa" },
    { value: "'Fira Code'", label: "Fira Code" },
    { value: "'JetBrains Mono'", label: "JetBrains Mono" },
    { value: "'Space Mono'", label: "Space Mono" },
    { value: "'Special Elite'", label: "Special Elite" },
    { value: "'Courier Prime'", label: "Courier Prime" }
];

const PRESET_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '30px', '36px', '48px', '64px', '72px'];

const Typography = ({ editor, isDragMode }: TypographyProps) => {
    const [currentFont, setCurrentFont] = useState("'Kaushan Script'");
    const [currentSize, setCurrentSize] = useState('16px');
    const [currentAlign, setCurrentAlign] = useState('left');

    useEffect(() => {
        if (!editor) return;

        const updateState = () => {
            try {
                let attrs = editor.getAttributes('textStyle');

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

                if (attrs.fontFamily) {
                    const family = attrs.fontFamily.replace(/['"]/g, '').trim();
                    const presets = FONTS.map(f => f.value.replace(/['"]/g, ''));
                    const match = presets.find(p => family === p || family.includes(p) || p.includes(family));
                    if (match) {
                        const selectVal = match.includes(' ') ? `'${match}'` : match;
                        setCurrentFont(selectVal);
                    } else {
                        setCurrentFont(family);
                    }
                } else {
                    setCurrentFont("'Kaushan Script'");
                }

                if (attrs.fontSize) {
                    setCurrentSize(attrs.fontSize);
                } else {
                    if (editor.isActive('heading', { level: 1 })) setCurrentSize('36px');
                    else if (editor.isActive('heading', { level: 2 })) setCurrentSize('30px');
                    else if (editor.isActive('heading', { level: 3 })) setCurrentSize('24px');
                    else setCurrentSize('16px');
                }

                if (editor.isActive({ textAlign: 'center' })) setCurrentAlign('center');
                else if (editor.isActive({ textAlign: 'right' })) setCurrentAlign('right');
                else if (editor.isActive({ textAlign: 'justify' })) setCurrentAlign('justify');
                else setCurrentAlign('left');

            } catch (err) {
                console.warn('Typography controls update error:', err);
            }
        };

        editor.on('selectionUpdate', updateState);
        editor.on('transaction', updateState);

        return () => {
            editor.off('selectionUpdate', updateState);
            editor.off('transaction', updateState);
        };
    }, [editor]);

    return (
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
                {FONTS.map(font => (
                    <option key={font.value} value={font.value}>{font.label}</option>
                ))}
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
                {!PRESET_SIZES.includes(currentSize) && (
                    <option value={currentSize}>{currentSize}</option>
                )}
                {PRESET_SIZES.map(size => (
                    <option key={size} value={size}>{size}</option>
                ))}
            </select>
        </div>
    );
};

export default Typography;
