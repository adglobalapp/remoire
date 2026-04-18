import React from 'react';
import { type LucideIcon } from 'lucide-react';
import styles from './FeatureCard.module.css';

interface FeatureCardProps {
    icon: LucideIcon;
    title: string;
    content: string;
    children?: React.ReactNode;
    accentColor?: string;
    index: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
    icon: Icon,
    title,
    content,
    children,
    accentColor,
    index
}) => {
    const isEven = index % 2 === 0;

    return (
        <div
            className={`${styles.card} ${isEven ? styles.even : styles.odd}`}
            style={{ '--accent-color': accentColor } as React.CSSProperties}
        >
            <Icon className={styles.icon} />
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.content}>{content}</p>
            <div className={styles.mockContainer}>
                {children}
            </div>
        </div>
    );
};

export default FeatureCard;
