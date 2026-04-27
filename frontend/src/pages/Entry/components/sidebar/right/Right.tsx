import { PanelRight, X } from 'lucide-react';
import { type LeftProps } from '../../../../../types';
import styles from './Right.module.css';
import Date from './components/Date';
import Location from './components/Location';
import Participants from './components/Participants';

const Right = ({ isOpen: propOpen, onToggle }: LeftProps) => {
    const mobileOpen = propOpen || false;
    const toggle = onToggle || (() => {});

    return (
        <div className={mobileOpen ? styles.mobileVisible : styles.mobileHidden}>
            <button
                className={`sidebar-toggle-fab ${styles.mobileToggle}`}
                onClick={toggle}
                aria-label={mobileOpen ? 'Close sidebar' : 'Open sidebar'}
            >
                <PanelRight size={20} />
            </button>

            <aside className="sidebar-container sidebar-burgundy">
                <div className="sidebar-header">
                    <h3>Entry Details</h3>
                    <button className="sidebar-close-btn" onClick={toggle} aria-label="Close sidebar">
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.scrollContent}>
                    <Location />
                    <Date />
                    <Participants />
                </div>
            </aside>
        </div>
    );
};

export default Right;
