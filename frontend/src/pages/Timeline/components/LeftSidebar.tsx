import { useState, useEffect, useRef } from 'react';
import { Trash2, Plus, Search, PanelLeft, X } from 'lucide-react';
import DeleteConfirmationModal from '../../../components/common/DeleteConfirmationModal';
import { useTimelineContext } from '../../../contexts/TimelineContext';
import { usePage } from '../../../App';
import styles from './LeftSidebar.module.css';


interface LeftSidebarProps {
    isOpen?: boolean;
    onToggle?: () => void;
}

const LeftSidebar = ({ isOpen: propOpen, onToggle }: LeftSidebarProps) => {
    const { timelines, activeTimeline, selectTimeline, createTimeline, deleteTimeline, isLoading } = useTimelineContext();
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);
    const { page } = usePage();
    const lastPage = useRef(page);
    const lastId = useRef(activeTimeline?.id);

    const mobileOpen = propOpen || false;
    const toggle = onToggle || (() => {});

    // Auto-close on page or timeline change (only on mobile/tablet)
    useEffect(() => {
        const isLargeScreen = window.innerWidth > 1400;
        if (isLargeScreen) return;

        const pageChanged = page !== lastPage.current;
        const timelineChanged = activeTimeline?.id !== lastId.current;

        if (pageChanged || timelineChanged) {
            if (onToggle && propOpen) {
                onToggle();
            }
        }
    }, [page, activeTimeline?.id, onToggle, propOpen]);

    useEffect(() => {
        lastPage.current = page;
        lastId.current = activeTimeline?.id;
    }, [page, activeTimeline?.id]);

    const filtered = timelines.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreate = () => {
        const name = newName.trim();
        if (name) {
            createTimeline(name);
        }
        setNewName('');
        setIsCreating(false);
    };

    const handleDelete = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        setItemToDelete(id);
    };

    const confirmDelete = () => {
        if (itemToDelete !== null) {
            deleteTimeline(itemToDelete);
            setItemToDelete(null);
        }
    };

    return (
        <div className={mobileOpen ? styles.mobileVisible : styles.mobileHidden}>
            <button
                className={`sidebar-toggle-fab ${styles.mobileToggle}`}
                onClick={toggle}
                aria-label={mobileOpen ? 'Close sidebar' : 'Open sidebar'}
            >
                {<PanelLeft size={20} />}
            </button>

            <aside className="sidebar-container">
                <div className="sidebar-header">
                    <h3>My Timelines</h3>
                    <button className="sidebar-close-btn" onClick={toggle} aria-label="Close sidebar">
                        <X size={20} />
                    </button>
                </div>

                <div className="sidebar-list">
                    {isLoading ? (
                        <div className="sidebar-empty-state">Loading timelines...</div>
                    ) : (
                        <>
                            {filtered.map((timeline) => (
                                <div
                                    key={timeline.id}
                                    className={`sidebar-item ${activeTimeline?.id === timeline.id ? 'active' : ''}`}
                                    onClick={() => selectTimeline(timeline)}
                                >
                                    <div className="sidebar-item-info">
                                        <span className="sidebar-item-title">{timeline.name}</span>
                                        {timeline.isDefault && (
                                            <span className="sidebar-item-meta">default</span>
                                        )}
                                    </div>
                                    {!timeline.isDefault && (
                                        <button
                                            className="sidebar-delete-btn"
                                            onClick={(e) => handleDelete(e, timeline.id)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}

                            {filtered.length === 0 && (
                                <div className="sidebar-empty-state">No timelines found.</div>
                            )}
                        </>
                    )}
                </div>

                <div className="sidebar-footer">
                    {isCreating ? (
                        <div className={styles.createRow}>
                            <input
                                autoFocus
                                type="text"
                                placeholder="Timeline name..."
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleCreate();
                                    if (e.key === 'Escape') { setIsCreating(false); setNewName(''); }
                                }}
                            />
                            <button className={styles.confirmBtn} onClick={handleCreate}>
                                <Plus size={16} />
                            </button>
                        </div>
                    ) : (
                        <button
                            className="btn btn-primary w-full sidebar-btn-add"
                            onClick={() => setIsCreating(true)}
                        >
                            <Plus size={16} /> Add Timeline
                        </button>
                    )}
                    <div className="sidebar-search-box">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search size={16} className="sidebar-search-icon" />
                    </div>
                </div>

                <DeleteConfirmationModal
                    isOpen={itemToDelete !== null}
                    onClose={() => setItemToDelete(null)}
                    onConfirm={confirmDelete}
                    title="Delete Timeline"
                    message={
                        <span>
                            Are you sure you want to delete <strong>{timelines.find(t => t.id === itemToDelete)?.name}</strong>? This action cannot be undone.
                        </span>
                    }
                />
            </aside>
        </div>
    );
};

export default LeftSidebar;