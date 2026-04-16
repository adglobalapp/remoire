import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Plus, Search, PanelLeft, X, Loader2 } from 'lucide-react';
import DeleteConfirmation from '../../../../components/common/DeleteConfirmation';
import { useEntryContext } from '../../../../contexts/EntryContext';
import { formatDateTime } from '../../../../utils/dateUtils';
import { useLocation } from 'react-router-dom';
import styles from './Left.module.css';
import { type LeftProps } from '../../../../types';

const Left = ({ isOpen: propOpen, onToggle }: LeftProps) => {
    const { entries, activeEntry, selectEntry, createEntry, deleteEntry } = useEntryContext();
    const [activeFilter, setActiveFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const { pathname } = useLocation();
    const lastPage = useRef(pathname);
    const lastId = useRef(activeEntry?.id);
    const mobileOpen = propOpen || false;
    const toggle = onToggle || (() => { });

    useEffect(() => {
        const isLargeScreen = window.innerWidth > 1400;
        if (isLargeScreen) return;

        const pageChanged = pathname !== lastPage.current;
        const entryChanged = activeEntry?.id !== lastId.current;

        if (pageChanged || entryChanged) {
            if (onToggle && propOpen) {
                onToggle();
            }
        }
    }, [pathname, activeEntry?.id, onToggle, propOpen]);

    useEffect(() => {
        lastPage.current = pathname;
        lastId.current = activeEntry?.id;
    }, [pathname, activeEntry?.id]);

    const filteredEntries = entries.filter(entry => {
        const matchesSearch = (entry.title || '').toLowerCase().includes(searchQuery.toLowerCase());
        if (activeFilter === 'all') return matchesSearch;

        const entryDate = new Date(entry.created_at);
        const now = new Date();

        if (activeFilter === 'today') {
            return matchesSearch && entryDate.toDateString() === now.toDateString();
        }
        if (activeFilter === 'this-month') {
            return matchesSearch &&
                entryDate.getMonth() === now.getMonth() &&
                entryDate.getFullYear() === now.getFullYear();
        }
        if (activeFilter === 'this-year') {
            return matchesSearch && entryDate.getFullYear() === now.getFullYear();
        }
        return matchesSearch;
    });

    const handleDelete = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        setItemToDelete(id);
    };

    const confirmDelete = async () => {
        if (itemToDelete !== null) {
            setIsDeleting(true);
            try {
                await deleteEntry(itemToDelete);
            } finally {
                setIsDeleting(false);
                setItemToDelete(null);
            }
        }
    };

    const handleCreate = async () => {
        setIsCreating(true);
        try {
            await createEntry();
            if (window.innerWidth <= 1400 && onToggle && propOpen) {
                onToggle();
            }
        } finally {
            setIsCreating(false);
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
                    <h3>My Entries</h3>
                    <button className="sidebar-close-btn" onClick={toggle} aria-label="Close sidebar">
                        <X size={20} />
                    </button>
                </div>

                <div className="sidebar-list">
                    {filteredEntries.map((entry) => (
                        <div
                            key={entry.id}
                            className={`sidebar-item ${activeEntry?.id === entry.id ? 'active' : ''}`}
                            onClick={() => selectEntry(entry)}
                        >
                            <div className="sidebar-item-info">
                                <span className="sidebar-item-title">{entry.title || 'Untitled'}</span>
                                <span className="sidebar-item-meta">{formatDateTime(entry.created_at)}</span>
                            </div>
                            <button
                                className="sidebar-delete-btn"
                                onClick={(e) => handleDelete(e, entry.id)}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}

                    {filteredEntries.length === 0 && (
                        <div className="empty-state-placeholder">
                            No entries yet. Create one!
                        </div>
                    )}
                </div>

                <div className="sidebar-footer">
                    <button
                        className="btn btn-primary w-full sidebar-btn-add"
                        onClick={handleCreate}
                        disabled={isCreating}
                    >
                        {isCreating ? <><Loader2 size={16} className="animate-spin" /> Adding...</> : <><Plus size={16} /> Add Entry</>}
                    </button>
                    <div className="sidebar-search-box">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search size={16} className="sidebar-search-icon" />
                    </div>
                    <div className={styles.filterRow}>
                        {(['all', 'today', 'this-month', 'this-year'] as const).map(filter => (
                            <span
                                key={filter}
                                className={`${styles.filterItem} ${activeFilter === filter ? styles.active : ''}`}
                                onClick={() => setActiveFilter(filter)}
                            >
                                {filter === 'all' ? 'All' : filter === 'today' ? 'Today' : filter === 'this-month' ? 'This month' : 'This year'}
                            </span>
                        ))}
                    </div>
                </div>

                {itemToDelete !== null && (
                    <DeleteConfirmation
                        title="Delete Entry"
                        message={
                            <span>
                                Are you sure you want to delete <strong>{entries.find(e => e.id === itemToDelete)?.title || 'Untitled'}</strong>? This action cannot be undone.
                            </span>
                        }
                        confirmText="Delete"
                        isLoading={isDeleting}
                        loadingText="Deleting..."
                        onConfirm={confirmDelete}
                        onCancel={() => setItemToDelete(null)}
                    />
                )}
            </aside>
        </div>
    );
};


export default Left;
