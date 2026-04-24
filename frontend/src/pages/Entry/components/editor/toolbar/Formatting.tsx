import classNames from 'classnames';
import { type FormattingProps } from '../../../../../types';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, Undo, Redo, List, ListOrdered } from 'lucide-react';
import styles from './Formatting.module.css';

export const History = ({ editor, isDragMode }: FormattingProps) => (
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
);

export const TextFormatting = ({ editor, isDragMode }: FormattingProps) => (
    <div className={styles.toolbarGroup}>
        <button
            type="button"
            onClick={() => editor.chain().toggleBold().run()}
            disabled={isDragMode || !editor.can().chain().toggleBold().run()}
            className={classNames(styles.actionButton, {
                [styles.isActive]: editor.isActive('bold'),
            })}
            title="Bold"
        >
            <Bold size={18} />
        </button>
        <button
            type="button"
            onClick={() => editor.chain().toggleItalic().run()}
            disabled={isDragMode || !editor.can().chain().toggleItalic().run()}
            className={classNames(styles.actionButton, {
                [styles.isActive]: editor.isActive('italic'),
            })}
            title="Italic"
        >
            <Italic size={18} />
        </button>
        <button
            type="button"
            onClick={() => editor.chain().toggleUnderline().run()}
            disabled={isDragMode || !editor.can().chain().toggleUnderline().run()}
            className={classNames(styles.actionButton, {
                [styles.isActive]: editor.isActive('underline'),
            })}
            title="Underline"
        >
            <Underline size={18} />
        </button>
    </div>
);

export const Alignment = ({ editor, isDragMode }: FormattingProps) => (
    <div className={styles.toolbarGroup}>
        <button
            type="button"
            disabled={isDragMode}
            onClick={() => editor.chain().setTextAlign('left').run()}
            className={classNames(styles.actionButton, {
                [styles.isActive]: editor.isActive({ textAlign: 'left' }),
            })}
            title="Align Left"
        >
            <AlignLeft size={18} />
        </button>
        <button
            type="button"
            disabled={isDragMode}
            onClick={() => editor.chain().setTextAlign('center').run()}
            className={classNames(styles.actionButton, {
                [styles.isActive]: editor.isActive({ textAlign: 'center' }),
            })}
            title="Align Center"
        >
            <AlignCenter size={18} />
        </button>
        <button
            type="button"
            disabled={isDragMode}
            onClick={() => editor.chain().setTextAlign('right').run()}
            className={classNames(styles.actionButton, {
                [styles.isActive]: editor.isActive({ textAlign: 'right' }),
            })}
            title="Align Right"
        >
            <AlignRight size={18} />
        </button>
        <button
            type="button"
            disabled={isDragMode}
            onClick={() => editor.chain().setTextAlign('justify').run()}
            className={classNames(styles.actionButton, {
                [styles.isActive]: editor.isActive({ textAlign: 'justify' }),
            })}
            title="Justify"
        >
            <AlignJustify size={18} />
        </button>
    </div>
);

export const Lists = ({ editor, isDragMode }: FormattingProps) => (
    <div className={styles.toolbarGroup}>
        <button
            type="button"
            disabled={isDragMode}
            onClick={() => {
                editor.chain().toggleBulletList().run();
            }}
            className={classNames(styles.actionButton, {
                [styles.isActive]: editor.isActive('bulletList'),
            })}
            title="Bullet List"
        >
            <List size={18} />
        </button>
        <button
            type="button"
            disabled={isDragMode}
            onClick={() => {
                editor.chain().toggleOrderedList().run();
            }}
            className={classNames(styles.actionButton, {
                [styles.isActive]: editor.isActive('orderedList'),
            })}
            title="Ordered List"
        >
            <ListOrdered size={18} />
        </button>
    </div>
);
