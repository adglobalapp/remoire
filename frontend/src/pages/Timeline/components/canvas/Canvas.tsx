import { useState, useMemo, useEffect } from 'react';
import { Plus } from 'lucide-react';
import AddNode from '../modal/AddNode';
import Node from './Node';
import { useTimelineContext } from '../../../../contexts/TimelineContext';
import Loader from '../../../../components/common/Loader';
import { useEntryContext } from '../../../../contexts/EntryContext';
import { useCanvasNavigation } from '../../../../hooks/useCanvasNavigation';
import { compareDates } from '../../../../utils/dateUtils';
import { type Entry } from '../../../../types';
import styles from './Canvas.module.css';

const Canvas = () => {
    const { activeTimeline, isLoading } = useTimelineContext();
    const { entries } = useEntryContext();

    const {
        transform,
        setTransform,
        isDragging,
        containerRef,
        handleMouseDown,
        handleTouchStart,
    } = useCanvasNavigation({ minScale: 0.3 });

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Initial centering (override the default hook transform)
    useEffect(() => {
        if (containerRef.current) {
            const width = containerRef.current.offsetWidth;
            const sidebarSpace = width > 1400 ? 660 : 32;
            const idealScale = (width - sidebarSpace) / 920;
            const initialScale = Math.min(1, idealScale);
            setTransform({ x: (width / 2) - (500 * initialScale), y: 60, scale: initialScale });
        }
    }, [setTransform]);

    // Filter and sort entries for the active timeline, ordered by entry.date
    const visibleEntries: Entry[] = useMemo(() => {
        if (!activeTimeline) return [];

        let filtered: Entry[];
        if (activeTimeline.isDefault) {
            filtered = [...entries];
        } else {
            filtered = entries.filter(e => activeTimeline.entryIds.includes(e.id));
        }

        // Sort by entry.date (YYYY-MM-DD), falling back to created_at
        return filtered.sort((a, b) => compareDates(a.date || a.created_at, b.date || b.created_at));
    }, [activeTimeline, entries]);

    const onMouseDown = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        const isNode = !!target.closest(`[class*="card"]`);
        const isButton = !!target.closest('button');
        const isInsideCanvas = !!target.closest(`.${styles.canvas}`) || target === containerRef.current;

        handleMouseDown(e, isInsideCanvas && !isNode && !isButton);
    };

    const onTouchStart = (e: React.TouchEvent) => {
        const target = e.target as HTMLElement;
        const isNode = !!target.closest(`[class*="card"]`);
        const isButton = !!target.closest('button');
        const isInsideCanvas = !!target.closest(`.${styles.canvas}`) || target === containerRef.current;

        const canDrag = (isInsideCanvas && !isNode && !isButton) || e.touches.length >= 2;
        handleTouchStart(e, canDrag);
    };

    return (
        <div
            ref={containerRef}
            className={`${styles.canvasContainer} ${isDragging ? styles.dragging : ''}`}
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
        >
            {isLoading && <Loader contextual />}
            {!isLoading && visibleEntries.length === 0 && (
                <div className={styles.emptyStateOverlay}>
                    <div className="empty-state-placeholder">
                        {activeTimeline?.isDefault 
                            ? 'No entries yet. Create your first one!' 
                            : 'No entries found in this timeline.'}
                    </div>
                </div>
            )}

            <div
                className={styles.canvas}
                style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})` }}
            >
                {visibleEntries.length > 0 && (
                    <div className={styles.timelineWrapper}>
                        {/* Vertical center line */}
                        <div className={styles.centerLine} />

                        {/* Year labels */}
                        {visibleEntries.map((entry, index) => {
                            const side: 'left' | 'right' = index % 2 === 0 ? 'left' : 'right';
                            return (
                                <Node
                                    key={`${activeTimeline?.id || 'default'}-${entry.id}`}
                                    entry={entry}
                                    side={side}
                                    index={index}
                                />
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Add Node Button in Top Right */}
            {activeTimeline && (
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className={`btn ${styles.addButton}`}
                    disabled={activeTimeline.isDefault}
                    title={activeTimeline.isDefault ? "Default timeline is not modifiable" : ""}
                >
                    <Plus size={18} /> Add Entry
                </button>
            )}

            {isAddModalOpen && (
                <AddNode onClose={() => setIsAddModalOpen(false)} />
            )}
        </div>
    );
};

export default Canvas;
