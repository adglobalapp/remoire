import { MapPin, Calendar, Plus } from 'lucide-react';
import styles from './RightSidebar.module.css';

const RightSidebar = () => {
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
                    <span>2024. 12. 24.</span>
                </div>
                <button className="btn btn-secondary btn-sm">
                    <Plus size={14} /> Add Date
                </button>
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
                    <Plus size={14} /> Add Participant
                </button>
            </div>

        </aside>
    );
};

export default RightSidebar;