import React, { useState } from 'react';
import { Book, History, StickyNote, Sparkles, Users, MapPin } from 'lucide-react';
import styles from './index.module.css';
import Avatar from '../../components/common/Avatar';
import FeatureCard from './components/FeatureCard';
import Login from '../../components/auth/Login';
import Register from '../../components/auth/Register';

const LandingPage: React.FC = () => {
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);

    return (
        <div className={styles.landingContainer}>
            <svg width="0" height="0" style={{ position: 'absolute' }}>
                <defs>
                    <linearGradient id="sparkle-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: 'var(--color-pink)' }} />
                        <stop offset="100%" style={{ stopColor: 'var(--color-mauve)' }} />
                    </linearGradient>
                </defs>
            </svg>

            <header className={styles.hero}>
                <h1 className={styles.title}>
                    <Sparkles className={styles.sparkle} />
                    Remoire
                </h1>
                <p className={styles.subtitle}>
                    Capture the rhythm of your life. A personal space for your stories, memories, and milestones.
                </p>
                <div className={styles.ctaButtons}>
                    <button onClick={() => setShowRegister(true)} className={styles.primaryBtn}>
                        Get Started
                    </button>
                    <button onClick={() => setShowLogin(true)} className={styles.secondaryBtn}>
                        Sign In
                    </button>
                </div>
            </header>

            {showLogin && (
                <Login
                    onClose={() => setShowLogin(false)}
                    onSwitchToRegister={() => {
                        setShowLogin(false);
                        setShowRegister(true);
                    }}
                />
            )}
            {showRegister && (
                <Register
                    onClose={() => setShowRegister(false)}
                    onSwitchToLogin={() => {
                        setShowRegister(false);
                        setShowLogin(true);
                    }}
                />
            )}

            <section className={styles.showcase}>
                <FeatureCard
                    icon={Book}
                    title="Personal Journal"
                    content="Keep a digital diary of your days. Whether it's a deep reflection or a quick highlight, record the moments that shape your story."
                    accentColor="var(--color-pink)"
                >
                    <div className={styles.mockNote}>
                        <div className={styles.mockNotePin} />
                        <div className={styles.mockTitle}>Coffee by the Danube ☕️</div>
                        <div className={styles.mockBody}>
                            The city felt so quiet this morning. Just me, a warm latte, and the sound of the water. Best way to start the
                            day...
                        </div>
                    </div>
                </FeatureCard>

                <FeatureCard
                    icon={History}
                    title="Living Timelines"
                    content="See your memories unfold on an interactive canvas. Connect different chapters of your life and see how your journey evolves over months and years."
                    accentColor="var(--color-sky)"
                >
                    <div className={styles.mockTimeline}>
                        <div className={styles.timelineLine} />
                        <div className={styles.timelineNodes}>
                            <div className={`${styles.node} ${styles.mockNode1}`} />
                            <div className={`${styles.node} ${styles.mockNode2}`} />
                            <div className={`${styles.node} ${styles.mockNode3}`} />
                            <div className={`${styles.node} ${styles.mockNode4}`} />
                        </div>
                    </div>
                </FeatureCard>

                <FeatureCard
                    icon={StickyNote}
                    title="Quick Thoughts"
                    content="For those small sparks of inspiration and random ideas that don't need a full entry. Pin them down instantly so you never lose a thought."
                    accentColor="var(--color-green)"
                >
                    <div className={styles.mockStickyNote}>
                        <div className={styles.stickyFold} />
                        <div className={styles.stickyContent}>Remember to check out the new bakery on Sunday! 🥐</div>
                    </div>
                </FeatureCard>

                <FeatureCard
                    icon={Users}
                    title="Share the Journey"
                    content="Stay connected with your inner circle. Share your favorite spots and latest updates, and keep up with what your friends are discovering too."
                    accentColor="var(--color-mauve)"
                >
                    <div className={styles.mockCommunity}>
                        <div className={styles.mockAvatars}>
                            <Avatar user={{ id: 1, name: 'L B' }} size={36} className={styles.mockAvatarItem} />
                            <Avatar user={{ id: 2, name: 'J D' }} size={36} className={styles.mockAvatarItem} />
                            <Avatar user={{ id: 3, name: 'K L' }} size={36} className={styles.mockAvatarItem} />
                        </div>
                        <div className={styles.mockLocation}>
                            <MapPin size={14} />
                            <span>Margaret Island</span>
                        </div>
                    </div>
                </FeatureCard>
            </section>

            <footer className={styles.footer}>
                <p>
                    &copy; 2026 Remoire. Created by <strong>Nagy Laura Blanka</strong>
                </p>
            </footer>
        </div>
    );
};

export default LandingPage;
