import React from 'react';
import { type AvatarProps } from '../../types';
import { PRESET_COLORS } from '../../utils/constants';
import styles from './Avatar.module.css';

const Avatar: React.FC<AvatarProps> = ({ user, size = 32, className = '', showName = false }) => {
    const getInitials = (name: string) => {
        if (!name) return '?';
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const getColor = (id?: number) => {
        if (id === undefined) return PRESET_COLORS[0];
        return PRESET_COLORS[id % PRESET_COLORS.length];
    };

    const avatarStyle = {
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${size * 0.6}px`,
        backgroundColor: user.avatar_url ? 'transparent' : getColor(user.id),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    };

    return (
        <div className={`${styles.avatarWrapper} ${className}`}>
            <div
                className={styles.avatarCircle}
                style={avatarStyle}
                title={user.name}
            >
                {user.avatar_url ? (
                    <img
                        src={user.avatar_url}
                        alt={user.name}
                        className={styles.avatarImage}
                    />
                ) : (
                    <span className={styles.initials}>{getInitials(user.name)}</span>
                )}
            </div>
            {showName && <span className={styles.userName}>{user.name}</span>}
        </div>
    );
};

export default Avatar;
