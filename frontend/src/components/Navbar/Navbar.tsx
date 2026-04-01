import { BookMarked, Users, Map, StickyNote, NotebookText, TrendingUp } from 'lucide-react';
import styles from './Navbar.module.css';
import { usePage } from '../../App';

const Navbar = () => {
    const { page, setPage } = usePage();

    return (
        <nav className={styles.navbar}>
            <div className={styles.logoSection}>
                <BookMarked size={25} />
                <span className="font-logo">Remoire</span>
            </div>

            <div className={styles.menuItems}>
                <a
                    href="#"
                    className={`${styles.link} ${page === 'entries' ? styles.active : ''}`}
                    onClick={(e) => { e.preventDefault(); setPage('entries'); }}
                >
                    <NotebookText size={20} /> Entries
                </a>

                <a
                    href="#"
                    className={`${styles.link} ${page === 'timelines' ? styles.active : ''}`}
                    onClick={(e) => { e.preventDefault(); setPage('timelines'); }}
                >
                    <TrendingUp size={20} /> Timelines
                </a>
                <a href="#" className={styles.link}>
                    <Users size={20} /> Friendlist
                </a>
                <a href="#" className={styles.link}>
                    <StickyNote size={20} /> Notes
                </a>
                <a href="#" className={styles.link}>
                    <Map size={20} /> Map
                </a>
            </div>

            <div className={styles.authButtons}>
                <button className="btn btn-secondary">Sign in</button>
                <button className="btn btn-primary">Register</button>
            </div>
        </nav>
    );
};

export default Navbar;