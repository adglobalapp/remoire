import { Search } from 'lucide-react';
import styles from '../Left.module.css';
import { type FilterProps } from '../../../../../../types';

const Filter = ({ searchQuery, setSearchQuery, activeFilter, setActiveFilter }: FilterProps) => {
    return (
        <>
            <div className="sidebar-search-box">
                <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                <Search size={16} className="sidebar-search-icon" />
            </div>
            <div className={styles.filterRow}>
                {(['all', 'today', 'this-month', 'this-year'] as const).map((filter) => (
                    <span
                        key={filter}
                        className={`${styles.filterItem} ${activeFilter === filter ? styles.active : ''}`}
                        onClick={() => setActiveFilter(filter)}
                    >
                        {filter === 'all' ? 'All' : filter === 'today' ? 'Today' : filter === 'this-month' ? 'This month' : 'This year'}
                    </span>
                ))}
            </div>
        </>
    );
};

export default Filter;
