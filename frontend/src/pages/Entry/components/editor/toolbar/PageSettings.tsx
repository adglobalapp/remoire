import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Settings } from 'lucide-react';
import classNames from 'classnames';
import { type PageSettingsProps } from '../../../../../types';
import styles from './PageSettings.module.css';

const PageSettings = ({ isDragMode, pageSettings, onPageSettingsChange }: PageSettingsProps) => {
    const [showSettings, setShowSettings] = useState(false);
    const settingsRef = useRef<HTMLDivElement>(null);
    const bgInputRef = useRef<HTMLInputElement>(null);

    const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

    useEffect(() => {
        if (showSettings && settingsRef.current) {
            setAnchorRect(settingsRef.current.getBoundingClientRect());
        }
    }, [showSettings]);

    useEffect(() => {
        if (!showSettings) return;

        const handleResize = () => {
            if (settingsRef.current) {
                setAnchorRect(settingsRef.current.getBoundingClientRect());
            }
        };

        const handleGlobalClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (settingsRef.current && !settingsRef.current.contains(target)) {
                setShowSettings(false);
            }
        };

        document.addEventListener('mousedown', handleGlobalClick);
        window.addEventListener('resize', handleResize);
        return () => {
            document.removeEventListener('mousedown', handleGlobalClick);
            window.removeEventListener('resize', handleResize);
        };
    }, [showSettings]);

    if (!pageSettings) return null;

    return (
        <div className={styles.settingsContainer} ref={settingsRef}>
            <button
                type="button"
                disabled={isDragMode}
                className={classNames(styles.actionButton, {
                    [styles.isActive]: showSettings,
                })}
                onClick={() => setShowSettings(!showSettings)}
                title="Page Settings"
            >
                <Settings size={18} />
            </button>

            {showSettings &&
                anchorRect &&
                createPortal(
                    <div
                        className={styles.settingsPopup}
                        onMouseDown={(e) => e.stopPropagation()}
                        style={{
                            position: 'fixed',
                            bottom: `${window.innerHeight - anchorRect.top + 8}px`,
                            left: `${anchorRect.left + anchorRect.width / 2}px`,
                            transform: 'translateX(-50%)',
                            zIndex: 10000,
                        }}
                    >
                        <div className={styles.settingsSection}>
                            <div className={styles.settingsLabel}>Background Image</div>
                            <div className={styles.bgActions}>
                                <button type="button" className={styles.btnSm} onClick={() => bgInputRef.current?.click()}>
                                    Upload
                                </button>
                                <button
                                    type="button"
                                    className={styles.btnSm}
                                    onClick={() =>
                                        onPageSettingsChange?.({
                                            ...pageSettings,
                                            backgroundUrl: null,
                                        })
                                    }
                                >
                                    Clear
                                </button>
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
                                            onPageSettingsChange?.({
                                                ...pageSettings,
                                                backgroundUrl: result,
                                            });
                                        };
                                        reader.readAsDataURL(file);
                                        e.target.value = '';
                                    }
                                }}
                                className={styles.hiddenInput}
                            />
                        </div>

                        <div className={styles.settingsDivider} />

                        <div className={styles.settingsSection}>
                            <div className={styles.settingsLabel}>Page Margins (px)</div>
                            <div className={styles.marginsGrid}>
                                <label className={styles.marginInput}>
                                    <span>Top</span>
                                    <input
                                        type="number"
                                        min="0"
                                        value={pageSettings.paddingTop}
                                        onChange={(e) =>
                                            onPageSettingsChange?.({
                                                ...pageSettings,
                                                paddingTop: Number(e.target.value),
                                            })
                                        }
                                    />
                                </label>
                                <label className={styles.marginInput}>
                                    <span>Bottom</span>
                                    <input
                                        type="number"
                                        min="0"
                                        value={pageSettings.paddingBottom}
                                        onChange={(e) =>
                                            onPageSettingsChange?.({
                                                ...pageSettings,
                                                paddingBottom: Number(e.target.value),
                                            })
                                        }
                                    />
                                </label>
                                <label className={styles.marginInput}>
                                    <span>Left</span>
                                    <input
                                        type="number"
                                        min="0"
                                        value={pageSettings.paddingLeft}
                                        onChange={(e) =>
                                            onPageSettingsChange?.({
                                                ...pageSettings,
                                                paddingLeft: Number(e.target.value),
                                            })
                                        }
                                    />
                                </label>
                                <label className={styles.marginInput}>
                                    <span>Right</span>
                                    <input
                                        type="number"
                                        min="0"
                                        value={pageSettings.paddingRight}
                                        onChange={(e) =>
                                            onPageSettingsChange?.({
                                                ...pageSettings,
                                                paddingRight: Number(e.target.value),
                                            })
                                        }
                                    />
                                </label>
                            </div>
                        </div>
                    </div>,
                    document.body,
                )}
        </div>
    );
};

export default PageSettings;
