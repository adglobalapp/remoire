import React, { useRef, useState } from 'react';
import { Camera, Copy, Trash2, Loader2, Check } from 'lucide-react';
import Avatar from '../../../components/common/Avatar';
import { useAuth } from '../../../contexts/AuthContext';
import { updateProfile } from '../../../api/profile';
import { uploadImage } from '../../../api/entries';
import toast from 'react-hot-toast';
import styles from './Header.module.css';
import sharedStyles from '../index.module.css';

const Header = () => {
    const { user, setUser } = useAuth();
    const [isUploading, setIsUploading] = useState(false);
    const [copied, setCopied] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!user) return null;

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const uploadRes = await uploadImage(file);
            if (uploadRes.error) throw new Error(uploadRes.error);
            const newUrl = uploadRes.url;

            if (newUrl) {
                const profileRes = await updateProfile({
                    name: user.name,
                    bio: user.bio ?? undefined,
                    avatar_url: newUrl,
                });
                setUser(profileRes.user);
                if (profileRes.message) toast.success(profileRes.message);
            }
        } catch (err) {
            toast.error((err as Error).message || 'Failed to upload image');
        } finally {
            setIsUploading(false);
        }
    };

    const handleAvatarDelete = async () => {
        if (!user.avatar_url) return;

        setIsUploading(true);
        try {
            const profileRes = await updateProfile({
                name: user.name,
                bio: user.bio ?? undefined,
                avatar_url: null,
            });
            setUser(profileRes.user);
            if (profileRes.message) toast.success(profileRes.message);
        } catch (err) {
            toast.error((err as Error).message || 'Failed to remove avatar');
        } finally {
            setIsUploading(false);
        }
    };

    const copyFriendCode = () => {
        if (user.friend_code) {
            navigator.clipboard.writeText(user.friend_code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast.success('Friend code copied');
        }
    };

    return (
        <header className={`${sharedStyles.profileCard} ${styles.profileHeader}`}>
            <div className={styles.avatarWrapper}>
                <Avatar
                    user={user}
                    size={140}
                    className={`${styles.avatarLarge} ${isUploading ? 'opacity-50' : ''}`}
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                />
                <div
                    className={`${styles.editAvatarOverlay} ${isUploading ? styles.disabled : ''}`}
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    title="Upload new avatar"
                >
                    <Camera size={16} />
                </div>
                {user.avatar_url && (
                    <button
                        className={styles.deleteAvatarBtn}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!isUploading) handleAvatarDelete();
                        }}
                        disabled={isUploading}
                        title="Delete avatar"
                    >
                        {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </button>
                )}
                <input type="file" ref={fileInputRef} className={styles.hiddenFileInput} accept="image/*" onChange={handleAvatarUpload} />
            </div>

            <div className={styles.headerMain}>
                <h1>{user.name}</h1>
                <p>{user.email}</p>
            </div>

            <div className={styles.headerStats}>
                <div className={styles.statItem}>
                    <span className={styles.statLabel}>Friend Code</span>
                    <div className={styles.statFlexContainer}>
                        <span className={`${styles.statValue} ${styles.friendCode}`}>{user.friend_code}</span>
                        <button onClick={copyFriendCode} className={styles.copyBtn} title="Copy Friend Code">
                            {copied ? <Check size={18} color="green" /> : <Copy size={18} />}
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
