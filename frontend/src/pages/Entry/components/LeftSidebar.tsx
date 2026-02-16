import { Trash2, Plus, Search } from 'lucide-react';
import styles from './LeftSidebar.module.css';

const LeftSidebar = () => {
    return (
        <aside className={styles.sidebarContainer}>
            <div className={styles.sidebarHeader}>
                <h3>My Entries</h3>
            </div>

            <div className={styles.entryList}>
                <div className={styles.entryItem}>
                    <div className={styles.entryInfo}>
                        <span className={styles.entryTitle}>Second entry</span>
                        <span className={styles.entryDate}>2025. 09. 21.</span>
                    </div>
                    <button className={styles.deleteBtn}>
                        <Trash2 size={18} />
                    </button>
                </div>

                <div className={`${styles.entryItem} ${styles.active}`}>
                    <div className={styles.entryInfo}>
                        <span className={styles.entryTitle}>Christmas</span>
                        <span className={styles.entryDate}>2025. 09. 21.</span>
                    </div>
                    <button className={styles.deleteBtn}>
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            <div className={styles.sidebarFooter}>
                <button className={`btn btn-primary w-full ${styles.btnAddSidebar}`}>
                    <Plus size={16} /> Add Entry
                </button>
                <div className={styles.searchBox}>
                    <input type="text" placeholder="Search..." />
                    <Search size={16} className={styles.searchIcon} />
                </div>
            </div>
        </aside>
    );
};

export default LeftSidebar;