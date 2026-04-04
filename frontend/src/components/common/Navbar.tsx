import { useState } from 'react';
import { BookMarked, Users, Map, StickyNote, NotebookText, TrendingUp, LogOut, User, Menu, X } from 'lucide-react';
import styles from './Navbar.module.css';
import { usePage } from '../../App';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
    const { page, setPage } = usePage();
    const { user, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);

    const handleNav = (p: Parameters<typeof setPage>[0]) => {
        setPage(p);
        setMenuOpen(false);
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.logoSection} onClick={() => handleNav('entries')} style={{ cursor: 'pointer' }}>
                <BookMarked size={25} />
                <span className="font-logo">Remoire</span>
            </div>

            {/* Desktop menu */}
            <div className={styles.menuItems}>
                <a
                    href="#"
                    className={`${styles.link} ${page === 'entries' ? styles.active : ''}`}
                    onClick={(e) => { e.preventDefault(); handleNav('entries'); }}
                >
                    <NotebookText size={20} /> Entries
                </a>

                <a
                    href="#"
                    className={`${styles.link} ${page === 'timelines' ? styles.active : ''}`}
                    onClick={(e) => { e.preventDefault(); handleNav('timelines'); }}
                >
                    <TrendingUp size={20} /> Timelines
                </a>
                <a
                    href="#"
                    className={`${styles.link} ${page === 'friends' ? styles.active : ''}`}
                    onClick={(e) => { e.preventDefault(); handleNav('friends'); }}
                >
                    <Users size={20} /> Friendlist
                </a>
                <a href="#" className={styles.link}>
                    <StickyNote size={20} /> Notes
                </a>
                <a href="#" className={styles.link}>
                    <Map size={20} /> Map
                </a>
            </div>

            <div className={styles.authSection}>
                {user && (
                    <div className={styles.userInfo}>
                        <div 
                            className={styles.userProfileTrigger} 
                            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                        >
                            <div className={styles.avatar}>
                                {user.avatar_url ? (
                                    <img src={user.avatar_url} alt={user.name} />
                                ) : (
                                    user.name.charAt(0)
                                )}
                            </div>
                            <span className={styles.userName}>{user.name}</span>
                        </div>

                        {profileMenuOpen && (
                            <div className={styles.profileDropdown}>
                                <div className={styles.dropdownHeader}>
                                    <span className={styles.dropdownHeaderName}>{user.name}</span>
                                </div>
                                <div className={styles.dropdownItem} onClick={() => { /* Not implemented yet */ }}>
                                    <User size={15} />
                                    <span>My Profile</span>
                                </div>
                                <div className={styles.dropdownSeparator} />
                                <div 
                                    className={`${styles.dropdownItem} ${styles.signOutItem}`} 
                                    onClick={() => { logout(); setProfileMenuOpen(false); }}
                                >
                                    <LogOut size={15} />
                                    <span>Sign Out</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Hamburger button – only on mobile */}
                <button
                    className={styles.hamburger}
                    onClick={() => setMenuOpen(o => !o)}
                    aria-label="Toggle menu"
                >
                    {menuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Mobile dropdown – absolute overlay so it doesn't shift content */}
            {menuOpen && (
                <div className={styles.mobileMenu}>
                    <a href="#" className={`${styles.mobileLink} ${page === 'entries' ? styles.active : ''}`}
                        onClick={(e) => { e.preventDefault(); handleNav('entries'); }}>
                        <NotebookText size={18} /> Entries
                    </a>
                    <a href="#" className={`${styles.mobileLink} ${page === 'timelines' ? styles.active : ''}`}
                        onClick={(e) => { e.preventDefault(); handleNav('timelines'); }}>
                        <TrendingUp size={18} /> Timelines
                    </a>
                    <a
                        href="#"
                        className={`${styles.mobileLink} ${page === 'friends' ? styles.active : ''}`}
                        onClick={(e) => { e.preventDefault(); handleNav('friends'); }}
                    >
                        <Users size={18} /> Friendlist
                    </a>
                    <a href="#" className={styles.mobileLink}>
                        <StickyNote size={18} /> Notes
                    </a>
                    <a href="#" className={styles.mobileLink}>
                        <Map size={18} /> Map
                    </a>
                    {user && (
                        <>
                            <div className={styles.mobileUserBadge}>
                                <User size={18} />
                                <span>{user.name}</span>
                            </div>
                            <button
                                className={`${styles.mobileLink} ${styles.mobileLinkLogout}`}
                                onClick={() => { logout(); setMenuOpen(false); }}
                            >
                                <LogOut size={18} className={styles.logoutIconRed} /> Sign out
                            </button>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;