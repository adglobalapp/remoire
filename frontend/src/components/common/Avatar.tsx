import React from 'react';
import { type AvatarProps } from '../../types';
import { PRESET_COLORS } from '../../utils/constants';
import styles from './Avatar.module.css';

const Avatar: React.FC<AvatarProps> = ({ user, text, size = 32, className = '', backgroundColor, onClick, title }) => {
    const getInitials = (name?: string) => {
        if (!name) return '?';
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
    };

    const getColor = (id?: number) => (id === undefined ? PRESET_COLORS[0] : PRESET_COLORS[id % PRESET_COLORS.length]);

    const displayText = text || (user ? getInitials(user.name) : '?');
    const finalBgColor = backgroundColor || (user?.avatar_url ? 'transparent' : getColor(user?.id));

    return (
        <div className={`${styles.avatarWrapper} ${className}`} title={title || user?.name || text || ''} onClick={onClick}>
            <div
                className={styles.avatarCircle}
                style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    fontSize: `${size * 0.6}px`,
                    backgroundColor: finalBgColor,
                    color: 'var(--color-dark-brown)',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                }}
            >
                {user?.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name} className={styles.avatarImage} />
                ) : (
                    <span className={styles.initials}>{displayText}</span>
                )}
            </div>
        </div>
    );
};

export default Avatar;
