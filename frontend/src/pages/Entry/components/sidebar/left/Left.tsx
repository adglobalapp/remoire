import React, { useState } from 'react';
import { Plus, PanelLeft, X, Loader2 } from 'lucide-react';
import DeleteConfirmation from '../../../../../components/common/DeleteConfirmation';
import { useEntryContext } from '../../../../../contexts/EntryContext';
import styles from './Left.module.css';
import { type LeftProps } from '../../../../../types';
import EntryItem from './components/EntryItem';
import Filter from './components/Filter';

const Left = ({ isOpen: propOpen, onToggle }: LeftProps) => {
    const { entries, activeEntry, selectEntry, createEntry, deleteEntry } = useEntryContext();
    const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'this-month' | 'this-year'>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);
    const [isConfirming, setIsConfirming] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const mobileOpen = propOpen || false;
    const toggle = onToggle || (() => {});

    const filteredEntries = entries.filter((entry) => {
        const matchesSearch = (entry.title || '').toLowerCase().includes(searchQuery.toLowerCase());
        if (activeFilter === 'all') return matchesSearch;

        const entryDate = new Date(entry.created_at);
        const now = new Date();

        if (activeFilter === 'today') {
            return matchesSearch && entryDate.toDateString() === now.toDateString();
        }
        if (activeFilter === 'this-month') {
            return matchesSearch && entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
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
            setIsConfirming(true);
            try {
                await deleteEntry(itemToDelete);
            } finally {
                setIsConfirming(false);
                setItemToDelete(null);
            }
        }
    };

    const handleCreate = async () => {
        setIsCreating(true);
        try {
            await createEntry();
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
                <PanelLeft size={20} />
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
                        <div key={entry.id} className={styles.sidebarItemAnimate}>
                            <EntryItem
                                entry={entry}
                                isActive={activeEntry?.id === entry.id}
                                onSelect={selectEntry}
                                onDelete={handleDelete}
                            />
                        </div>
                    ))}

                    {filteredEntries.length === 0 && <div className="empty-state-placeholder">No entries yet. Create one!</div>}
                </div>

                <div className="sidebar-footer">
                    <button className="btn btn-primary w-full sidebar-btn-add" onClick={handleCreate} disabled={isCreating}>
                        {isCreating ? (
                            <>
                                <Loader2 size={16} className="animate-spin" /> Adding...
                            </>
                        ) : (
                            <>
                                <Plus size={16} /> Add Entry
                            </>
                        )}
                    </button>
                    <Filter
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        activeFilter={activeFilter}
                        setActiveFilter={setActiveFilter}
                    />
                </div>

                {itemToDelete !== null && (
                    <DeleteConfirmation
                        title="Delete Entry"
                        message={
                            <span>
                                Are you sure you want to delete{' '}
                                <strong>{entries.find((e) => e.id === itemToDelete)?.title || 'Untitled'}</strong>? This action cannot be
                                undone.
                            </span>
                        }
                        confirmText="Delete"
                        isLoading={isConfirming}
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
