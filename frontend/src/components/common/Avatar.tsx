import React from 'react';
import { type AvatarProps } from '../../types';
import { PRESET_COLORS } from '../../utils/constants';
import styles from './Avatar.module.css';

const Avatar: React.FC<AvatarProps> = ({
    user,
    text,
    size = 32,
    className = '',
    showName = false,
    backgroundColor,
    color
}) => {
    const getInitials = (name: string) => {
        if (!name) return '?';
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
    };

    const getColor = (id?: number) =>
        id === undefined ? PRESET_COLORS[0] : PRESET_COLORS[id % PRESET_COLORS.length];

    const displayText = text || (user ? getInitials(user.name) : '?');
    const finalBgColor = backgroundColor || (user?.avatar_url ? 'transparent' : getColor(user?.id));
    const finalColor = color || (backgroundColor ? 'var(--color-burgundy)' : 'var(--color-dark-brown)');

    return (
        <div
            className={`${styles.avatarWrapper} ${className}`}
            title={user?.name || text || ''}
        >
            <div
                className={styles.avatarCircle}
                style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    fontSize: `${size * 0.6}px`,
                    backgroundColor: finalBgColor,
                    color: finalColor,
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0
                }}
            >
                {user?.avatar_url
                    ? <img src={user.avatar_url} alt={user.name} className={styles.avatarImage} />
                    : <span className={styles.initials}>{displayText}</span>
                }
            </div>
            {showName && user && <span className={styles.userName}>{user.name}</span>}
        </div>
    );
};

export default Avatar;
