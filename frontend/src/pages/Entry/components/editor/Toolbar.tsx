import { useRef, useEffect, useState } from 'react';
import { Hand, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import classNames from 'classnames';
import { type EditorToolbarProps } from '../../../../types';
import styles from './Toolbar.module.css';
import { History, TextFormatting, Alignment, Lists } from './toolbar/Formatting';
import Typography from './toolbar/Typography';
import ColorPalette from './toolbar/ColorPalette';
import PageSettings from './toolbar/PageSettings';

const Toolbar = ({
    editor,
    isDragMode = false,
    onToggleDragMode,
    onColorPickerToggle,
    pageSettings,
    onPageSettingsChange,
}: EditorToolbarProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);
    const [, forceUpdate] = useState({});

    useEffect(() => {
        if (!editor) return;

        const updateState = () => forceUpdate({});
        editor.on('selectionUpdate', updateState);
        editor.on('transaction', updateState);
        return () => {
            editor.off('selectionUpdate', updateState);
            editor.off('transaction', updateState);
        };
    }, [editor]);

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

        return () => {
            window.removeEventListener('resize', checkScroll);
        };
    }, [editor]);

    const scroll = (direction: 'left' | 'right') => {
        const container = scrollContainerRef.current;
        if (container) {
            const scrollAmount = 200;
            container.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    if (!editor) return null;

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                editor.chain().setImage({ src: result }).run();
            };
            reader.readAsDataURL(file);
            event.target.value = '';
        }
    };

    return (
        <div
            className={styles.toolbarWrapper}
            onPointerDown={(e) => {
                const target = e.target as HTMLElement;

                const isMobile = window.innerWidth <= 800;
                const isInput = !!target.closest('input, select');
                const isButton = target.closest('button');
                const isPopup = isButton?.matches(
                    '[title="Color Palette"], [title="Page Settings"], [title="Drag Tool"], [title="Upload Image"]',
                );

                if (isMobile && (isInput || isButton)) editor.commands.blur();
                if (isInput || (isMobile && (isPopup || !isButton))) return;

                e.preventDefault();
            }}
        >
            {showLeftArrow && (
                <button type="button" className={styles.scrollArrow} onClick={() => scroll('left')}>
                    <ChevronLeft size={16} />
                </button>
            )}

            <div ref={scrollContainerRef} className={styles.scrollContainer} onScroll={checkScroll}>
                <History editor={editor} isDragMode={isDragMode} />

                <div className={styles.divider} />

                <Typography editor={editor} isDragMode={isDragMode} />

                <div className={styles.divider} />

                <ColorPalette editor={editor} isDragMode={isDragMode} onColorPickerToggle={onColorPickerToggle} />

                <div className={styles.divider} />

                <TextFormatting editor={editor} isDragMode={isDragMode} />

                <div className={styles.divider} />

                <Alignment editor={editor} isDragMode={isDragMode} />

                <div className={styles.divider} />

                <Lists editor={editor} isDragMode={isDragMode} />

                <div className={styles.divider} />

                <div className={styles.toolbarGroup}>
                    <button
                        type="button"
                        className={styles.actionButton}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isDragMode}
                        title="Upload Image"
                    >
                        <ImageIcon size={18} />
                    </button>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className={styles.hiddenInput} />
                </div>

                <div className={styles.divider} />

                <PageSettings isDragMode={isDragMode} pageSettings={pageSettings} onPageSettingsChange={onPageSettingsChange} />

                <div className={styles.divider} />

                <div className={styles.toolbarGroup}>
                    <button
                        type="button"
                        onClick={onToggleDragMode}
                        className={classNames(styles.actionButton, {
                            [styles.isActive]: isDragMode,
                        })}
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

export default Toolbar;
