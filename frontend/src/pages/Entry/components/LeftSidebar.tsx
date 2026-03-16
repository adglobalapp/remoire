import { useState } from 'react';
import { Trash2, Plus, Search } from 'lucide-react';
import styles from './LeftSidebar.module.css';
import { useEntryContext } from '../../../contexts/EntryContext';

const LeftSidebar = () => {
    const { entries, activeEntry, selectEntry, createEntry, deleteEntry } = useEntryContext();
    const [activeFilter, setActiveFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('hu-HU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredEntries = entries.filter(entry => {
        const matchesSearch = entry.title.toLowerCase().includes(searchQuery.toLowerCase());
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
        e.stopPropagation(); // dont select entry on delete
        deleteEntry(id);
    };

    return (
        <aside className={styles.sidebarContainer}>
            <div className={styles.sidebarHeader}>
                <h3>My Entries</h3>
            </div>

            <div className={styles.entryList}>
                {filteredEntries.map((entry) => (
                    <div
                        key={entry.id}
                        className={`${styles.entryItem} ${activeEntry?.id === entry.id ? styles.active : ''}`}
                        onClick={() => selectEntry(entry)}
                    >
                        <div className={styles.entryInfo}>
                            <span className={styles.entryTitle}>{entry.title || 'Untitled'}</span>
                            <span className={styles.entryDate}>{formatDate(entry.created_at)}</span>
                        </div>
                        <button
                            className={styles.deleteBtn}
                            onClick={(e) => handleDelete(e, entry.id)}
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}

                {filteredEntries.length === 0 && (
                    <div className={styles.emptyState}>
                        No entries yet. Create one!
                    </div>
                )}
            </div>

            <div className={styles.sidebarFooter}>
                <button
                    className={`btn btn-primary w-full ${styles.btnAddSidebar}`}
                    onClick={createEntry}
                >
                    <Plus size={16} /> Add Entry
                </button>
                <div className={styles.searchBox}>
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search size={16} className={styles.searchIcon} />
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
        </aside>
    );
};

export default LeftSidebar;