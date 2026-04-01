import { MapPin, Calendar, Plus, Users } from 'lucide-react';
import styles from './RightSidebar.module.css';
import { useEntryContext } from '../../../contexts/EntryContext';

const RightSidebar = () => {
    const { activeEntry, updateEntryDate } = useEntryContext();

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
        <aside className={styles.sidebarContainer}>

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

        </aside>
    );
};

export default RightSidebar;