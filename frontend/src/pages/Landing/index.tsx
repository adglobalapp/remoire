import React from 'react';
import { Book, History, StickyNote, Sparkles, Users, MapPin } from 'lucide-react';
import styles from './index.module.css';
import { type LandingPageProps } from '../../types';
import Avatar from '../../components/common/Avatar';

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onRegister }) => {
    return (
        <div className={styles.landingContainer}>
            <header className={styles.hero}>
                <h1 className={styles.title}>
                    <Sparkles className={styles.sparkle} />
                    Remoire
                </h1>
                <p className={styles.subtitle}>Your life's journey, beautifully archived.</p>
                <div className={styles.ctaButtons}>
                    <button onClick={onRegister} className={styles.primaryBtn}>Get Started</button>
                    <button onClick={onLogin} className={styles.secondaryBtn}>Sign In</button>
                </div>
            </header>

            <section className={styles.showcase}>
                <div className={styles.showcaseCard}>
                    <Book className={styles.cardIcon} />
                    <h3 className={styles.cardTitle}>Daily Narratives</h3>
                    <p className={styles.cardContent}>Capture every thought and memory with our sleek editor.</p>
                    <div className={styles.mockNote}>
                        <div className={styles.mockNotePin} />
                        <div className={styles.mockTitle}>Morning Walk 🌲</div>
                        <div className={styles.mockBody}>The air was crisp and the sun peeked through the trees...</div>
                    </div>
                </div>

                <div className={styles.showcaseCard}>
                    <History className={styles.cardIcon} />
                    <h3 className={styles.cardTitle}>Visual Timelines</h3>
                    <p className={styles.cardContent}>See your life story unfold on an interactive canvas. Track milestones and moments in a beautiful, flowing history.</p>
                    <div className={styles.mockTimeline}>
                        <div className={styles.timelineLine} />
                        <div className={styles.timelineNodes}>
                            <div className={styles.node} style={{ background: '#89dceb' }} />
                            <div className={styles.node} style={{ background: '#fab387' }} />
                            <div className={styles.node} style={{ background: '#cba6f7' }} />
                            <div className={styles.node} style={{ background: '#f8a5c2' }} />
                        </div>
                    </div>
                </div>

                <div className={styles.showcaseCard}>
                    <StickyNote className={styles.cardIcon} />
                    <h3 className={styles.cardTitle}>Take Notes</h3>
                    <p className={styles.cardContent}>Quick thoughts or detailed entries. Your personal space.</p>
                    <div className={styles.mockStickyNote}>
                        <div className={styles.stickyFold} />
                        <div className={styles.stickyContent}>Don't forget to buy coffee! ☕️</div>
                    </div>
                </div>

                <div className={styles.showcaseCard}>
                    <Users className={styles.cardIcon} />
                    <h3 className={styles.cardTitle}>Mindful Sharing</h3>
                    <p className={styles.cardContent}>Share moments and locations with those who matter.</p>
                    <div className={styles.mockCommunity}>
                        <div className={styles.mockAvatars}>
                            <Avatar user={{ id: 1, name: 'L B' } as any} size={36} className={styles.mockAvatarItem} />
                            <Avatar user={{ id: 2, name: 'J D' } as any} size={36} className={styles.mockAvatarItem} />
                            <Avatar user={{ id: 3, name: 'K L' } as any} size={36} className={styles.mockAvatarItem} />
                        </div>
                        <div className={styles.mockLocation}>
                            <MapPin size={14} />
                            <span>Central Park</span>
                        </div>
                    </div>
                </div>
            </section>

            <footer className={styles.footer}>
                <p>&copy; 2026 Remoire. Designed for the mindful storyteller.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
