import { useState } from 'react';
import { BookMarked, Users, Map, StickyNote, NotebookText, TrendingUp, LogOut, User, Menu, X } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';
import { useAuth } from '../../contexts/AuthContext';
import Avatar from './Avatar';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);

    return (
        <nav className={styles.navbar}>
            <div className={styles.logoSection} onClick={() => navigate('/entries')} style={{ cursor: 'pointer' }}>
                <BookMarked size={22} />
                <span className={`font-logo ${styles.logoText}`}>Remoire</span>
            </div>

            {/* Desktop menu */}
            <div className={styles.menuItems}>
                <NavLink
                    to="/entries"
                    className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
                >
                    <NotebookText size={20} /> Entries
                </NavLink>

                <NavLink
                    to="/timelines"
                    className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
                >
                    <TrendingUp size={20} /> Timelines
                </NavLink>
                <NavLink
                    to="/friends"
                    className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
                >
                    <Users size={20} /> Friendlist
                </NavLink>
                <NavLink
                    to="/notes"
                    className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
                >
                    <StickyNote size={20} /> Notes
                </NavLink>
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
                            <Avatar user={user} size={32} />
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
                    <NavLink to="/entries" className={({ isActive }) => `${styles.mobileLink} ${isActive ? styles.active : ''}`} onClick={() => setMenuOpen(false)}>
                        <NotebookText size={18} /> Entries
                    </NavLink>

                    <NavLink to="/timelines" className={({ isActive }) => `${styles.mobileLink} ${isActive ? styles.active : ''}`} onClick={() => setMenuOpen(false)}>
                        <TrendingUp size={18} /> Timelines
                    </NavLink>

                    <NavLink to="/friends" className={({ isActive }) => `${styles.mobileLink} ${isActive ? styles.active : ''}`} onClick={() => setMenuOpen(false)}>
                        <Users size={18} /> Friendlist
                    </NavLink>

                    <NavLink to="/notes" className={({ isActive }) => `${styles.mobileLink} ${isActive ? styles.active : ''}`} onClick={() => setMenuOpen(false)}>
                        <StickyNote size={18} /> Notes
                    </NavLink>

                    <a href="#" className={styles.mobileLink}>
                        <Map size={18} /> Map
                    </a>
                    {user && (
                        <>
                            <div className={styles.mobileUserBadge}>
                                <Avatar user={user} size={28} />
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