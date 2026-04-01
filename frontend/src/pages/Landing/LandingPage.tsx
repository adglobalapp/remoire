import React from 'react';
import { Book, History, Shield, Sparkles } from 'lucide-react';
import styles from './LandingPage.module.css';

interface LandingPageProps {
    onLogin: () => void;
    onRegister: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onRegister }) => {
    return (
        <div className={styles.landingContainer}>
            <header className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1 className={styles.title}>
                        <Sparkles className={styles.sparkle} />
                        Remoire
                    </h1>
                    <p className={styles.subtitle}>Your life's journey, beautifully archived.</p>
                    <div className={styles.ctaButtons}>
                        <button onClick={onRegister} className={styles.primaryBtn}>Get Started</button>
                        <button onClick={onLogin} className={styles.secondaryBtn}>Sign In</button>
                    </div>
                </div>
            </header>

            <section className={styles.features}>
                <div className={styles.featureCard}>
                    <Book className={styles.featureIcon} />
                    <h3>Daily Narratives</h3>
                    <p>Capture every thought and memory with our sleek Tiptap-powered editor. Drag and drop images, style your prose, and relive your days.</p>
                </div>
                <div className={styles.featureCard}>
                    <History className={styles.featureIcon} />
                    <h3>Visual Timelines</h3>
                    <p>See your history unfold on a zoomable, interactive canvas. Organize your entries into custom timelines for different chapters of your life.</p>
                </div>
                <div className={styles.featureCard}>
                    <Shield className={styles.featureIcon} />
                    <h3>Private & Secure</h3>
                    <p>Your memories are yours alone. With per-user data isolation and secure authentication, your private reflections stay private.</p>
                </div>
            </section>

            <footer className={styles.footer}>
                <p>&copy; 2026 Remoire. Designed for the mindful storyteller.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
