import { useEffect, useRef } from 'react';
import { MapPin, Calendar, Plus, Users, PanelRight, X } from 'lucide-react';
import { useEntryContext } from '../../../contexts/EntryContext';
import { usePage } from '../../../App';
import styles from './RightSidebar.module.css';

interface RightSidebarProps {
    isOpen?: boolean;
    onToggle?: () => void;
}

const RightSidebar = ({ isOpen: propOpen, onToggle }: RightSidebarProps) => {
    const { activeEntry, updateEntryDate } = useEntryContext();
    const { page } = usePage();
    const lastPage = useRef(page);

    const mobileOpen = propOpen || false;
    const toggle = onToggle || (() => { });

    // Auto-close on page change (only on mobile/tablet)
    useEffect(() => {
        const isLargeScreen = window.innerWidth > 1400;
        if (isLargeScreen) return;

        if (page !== lastPage.current) {
            if (onToggle && propOpen) {
                onToggle();
            }
        }
        lastPage.current = page;
    }, [page, onToggle, propOpen]);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (activeEntry) {
            updateEntryDate(activeEntry.id, e.target.value);
        }
    };

    // Format stored date (YYYY-MM-DD) for the date input
    const dateValue = activeEntry?.date
        ? activeEntry.date.substring(0, 10)
        : '';

    return (
        <div className={mobileOpen ? styles.mobileVisible : styles.mobileHidden}>
            <button
                className={`sidebar-toggle-fab ${styles.mobileToggle}`}
                onClick={toggle}
                aria-label={mobileOpen ? 'Close sidebar' : 'Open sidebar'}
            >
                {<PanelRight size={20} />}
            </button>

            <aside className={`sidebar-container sidebar-burgundy ${styles.sidebarContainer}`}>
                <div className="sidebar-header">
                    <h3>Entry Details</h3>
                    <button className="sidebar-close-btn" onClick={toggle} aria-label="Close sidebar">
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.scrollContent}>
                    <div className={styles.metaGroup}>
                        <label className="text-small">Location</label>
                        <div className={styles.metaValue}>
                            <MapPin size={22} className={styles.iconColor} />
                            <span>St. Stephen Str...</span>
                        </div>
                        <button className="btn btn-secondary btn-sm">
                            <Plus size={14} /> Add Location
                        </button>
                    </div>

                    <div className={styles.metaGroup}>
                        <label className="text-small">Date</label>
                        <div className={styles.metaValue}>
                            <Calendar size={22} className={styles.iconColor} />
                            <input
                                type="date"
                                value={dateValue}
                                onChange={handleDateChange}
                                onClick={(e) => 'showPicker' in e.target && (e.target as HTMLInputElement).showPicker()}
                                className={styles.dateInput}
                                disabled={!activeEntry}
                            />
                        </div>
                    </div>

                    <div className={styles.metaGroup}>
                        <label className="text-small">Participants</label>
                        <div className={styles.participantList}>
                            <div className={styles.participantRow}>
                                <span>John</span>
                                <div className={styles.avatar}>J</div>
                            </div>
                            <div className={styles.participantRow}>
                                <span>Mom</span>
                                <div className={styles.avatar} style={{ backgroundColor: '#eab8b8' }}>M</div>
                            </div>
                        </div>

                        <button className="btn btn-secondary btn-sm">
                            <Users size={14} /> Add Participant
                        </button>
                    </div>
                </div>
            </aside>
        </div>
    );
};

export default RightSidebar;