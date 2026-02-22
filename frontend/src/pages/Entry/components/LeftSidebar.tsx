import { useEffect, useState } from 'react';
import { Trash2, Plus, Search } from 'lucide-react';
import styles from './LeftSidebar.module.css';
import { getEntries, type Entry } from '../../../services/api';

const LeftSidebar = () => {
    const [entries, setEntries] = useState<Entry[]>([]);
    const [activeId, setActiveId] = useState<number | null>(null);
    const [activeFilter, setActiveFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');

    useEffect(() => {
        const loadEntries = async () => {
            const data = await getEntries();
            setEntries(data);
            if (data.length > 0) {
                setActiveId(data[0].id);
            }
        };
        loadEntries();
    }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('hu-HU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).replace(/\.\s/g, '. ');
    };

    const filteredEntries = entries.filter(entry => {
        const matchesSearch = entry.title.toLowerCase().includes(searchQuery.toLowerCase());

        if (activeFilter === 'all') return matchesSearch;

        const entryDate = new Date(entry.date);
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

    return (
        <aside className={styles.sidebarContainer}>
            <div className={styles.sidebarHeader}>
                <h3>My Entries</h3>
            </div>

            <div className={styles.entryList}>
                {filteredEntries.map((entry) => (
                    <div
                        key={entry.id}
                        className={`${styles.entryItem} ${activeId === entry.id ? styles.active : ''}`}
                        onClick={() => setActiveId(entry.id)}
                    >
                        <div className={styles.entryInfo}>
                            <span className={styles.entryTitle}>{entry.title}</span>
                            <span className={styles.entryDate}>{formatDate(entry.date)}</span>
                        </div>
                        <button className={styles.deleteBtn}>
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>

            <div className={styles.sidebarFooter}>
                <button className={`btn btn-primary w-full ${styles.btnAddSidebar}`}>
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
                    <span
                        className={`${styles.filterItem} ${activeFilter === 'all' ? styles.active : ''}`}
                        onClick={() => setActiveFilter('all')}
                    >
                        All
                    </span>
                    <span
                        className={`${styles.filterItem} ${activeFilter === 'today' ? styles.active : ''}`}
                        onClick={() => setActiveFilter('today')}
                    >
                        Today
                    </span>
                    <span
                        className={`${styles.filterItem} ${activeFilter === 'this-month' ? styles.active : ''}`}
                        onClick={() => setActiveFilter('this-month')}
                    >
                        This month
                    </span>
                    <span
                        className={`${styles.filterItem} ${activeFilter === 'this-year' ? styles.active : ''}`}
                        onClick={() => setActiveFilter('this-year')}
                    >
                        This year
                    </span>
                </div>
            </div>
        </aside>
    );
};

export default LeftSidebar;