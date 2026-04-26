import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './index.module.css';
import Avatar from '../../components/common/Avatar';
import { User, Lock, Camera, Copy, Check, UserMinus, AlertCircle, Loader2, Trash2 } from 'lucide-react';
import { updateProfile, updatePassword, getBlockedUsers } from '../../api/profile';
import { uploadImage } from '../../api/entries';
import toast from 'react-hot-toast';
import { useUserProfile } from '../../contexts/UserProfileContext';
import { type User as UserType, type ApiError } from '../../types';

const Profile = () => {
    const { user, setUser } = useAuth();
    const [blocked, setBlocked] = useState<UserType[]>([]);
    const [isProfileLoading, setIsProfileLoading] = useState(false);
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);
    const [blockedLoading, setBlockedLoading] = useState(false);
    const [unblockingId, setUnblockingId] = useState<number | null>(null);
    const [copied, setCopied] = useState(false);
    const { showProfile, blockedUserIds, unblockUser } = useUserProfile();

    const [name, setName] = useState(user?.name || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [passwords, setPasswords] = useState({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchBlocked = useCallback(async (silent = false) => {
        if (!silent) setBlockedLoading(true);
        const data = await getBlockedUsers();
        setBlocked(data.map((u) => ({ ...u, relationship_status: 'blocked' })));
        if (!silent) setBlockedLoading(false);
    }, []);

    useEffect(() => {
        fetchBlocked(false);
    }, [blockedUserIds.size, fetchBlocked]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProfileLoading(true);
        setFieldErrors({});
        try {
            const res = await updateProfile({ name, bio });
            setUser(res.user);
            if (res?.message) toast.success(res.message);
        } catch (err) {
            const error = err as ApiError;
            if (error.status === 422 && error.errors) {
                setFieldErrors(error.errors);
            } else {
                toast.error(error.message || 'Update failed');
            }
        } finally {
            setIsProfileLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPasswordLoading(true);
        setFieldErrors({});
        try {
            const res = await updatePassword(passwords);
            setPasswords({
                current_password: '',
                password: '',
                password_confirmation: '',
            });
            if (res?.message) toast.success(res.message);
        } catch (err) {
            const error = err as ApiError;
            if (error.status === 422 && error.errors) {
                setFieldErrors(error.errors);
            } else {
                toast.error(error.message || 'Security update failed');
            }
        } finally {
            setIsPasswordLoading(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsProfileLoading(true);
        try {
            const uploadRes = await uploadImage(file);
            if (uploadRes.error) throw new Error(uploadRes.error);
            const newUrl = uploadRes.url;

            if (newUrl) {
                const profileRes = await updateProfile({
                    name,
                    bio,
                    avatar_url: newUrl,
                });
                setUser(profileRes.user);
                if (profileRes.message) toast.success(profileRes.message);
            }
        } catch (err) {
            const error = err as Error;
            toast.error(error.message || 'Failed to upload image');
        } finally {
            setIsProfileLoading(false);
        }
    };

    const handleAvatarDelete = async () => {
        if (!user || !user.avatar_url) return;

        setIsProfileLoading(true);
        try {
            const profileRes = await updateProfile({
                name,
                bio,
                avatar_url: null,
            });
            setUser(profileRes.user);
            if (profileRes.message) toast.success(profileRes.message);
        } catch (err) {
            const error = err as Error;
            toast.error(error.message || 'Failed to remove avatar');
        } finally {
            setIsProfileLoading(false);
        }
    };

    const handleUnblock = async (id: number) => {
        setUnblockingId(id);
        const success = await unblockUser(id);
        if (success) {
            setBlocked((prev) => prev.filter((u) => u.id !== id));
        }
        setUnblockingId(null);
    };

    const copyFriendCode = () => {
        if (user?.friend_code) {
            navigator.clipboard.writeText(user.friend_code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast.success('Friend code copied');
        }
    };

    if (!user) return null;

    const renderFieldError = (fieldName: string) => {
        const errors = fieldErrors[fieldName];
        if (errors && errors.length > 0) {
            return (
                <div className="field-errors-container">
                    {errors.map((msg, idx) => (
                        <span key={idx} className="field-error-text">
                            <AlertCircle size={16} /> {msg}
                        </span>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className={styles.profilePage}>
            <div className={styles.profileContainer}>
                <header className={`${styles.profileCard} ${styles.profileHeader}`}>
                    <div className={styles.avatarWrapper}>
                        <Avatar user={user} size={140} className={styles.avatarLarge} onClick={() => fileInputRef.current?.click()} />
                        <div className={styles.editAvatarOverlay} onClick={() => fileInputRef.current?.click()} title="Upload new avatar">
                            <Camera size={16} />
                        </div>
                        {user?.avatar_url && (
                            <div
                                className={styles.deleteAvatarBtn}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleAvatarDelete();
                                }}
                                title="Delete avatar"
                            >
                                <Trash2 size={16} />
                            </div>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            className={styles.hiddenFileInput}
                            accept="image/*"
                            onChange={handleAvatarUpload}
                        />
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

                <div className={`${styles.profileCard} ${styles.formGrid}`}>
                    <section className={styles.settingsSection}>
                        <h2 className={styles.sectionTitle}>
                            <User size={22} /> Details
                        </h2>
                        <form className={styles.form} onSubmit={handleUpdateProfile} noValidate>
                            <div className={styles.inputGroup}>
                                <label htmlFor="profile-name">What should we call you?</label>
                                <input
                                    id="profile-name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className={fieldErrors.name ? 'input-error' : ''}
                                    placeholder="Your displayed name"
                                />
                                {renderFieldError('name')}
                            </div>
                            <div className={styles.inputGroup}>
                                <label htmlFor="profile-bio">Bio</label>
                                <textarea
                                    id="profile-bio"
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    className={`${fieldErrors.bio ? 'input-error' : ''} ${styles.bioTextarea}`}
                                    placeholder="Bio, status, or notes..."
                                    rows={4}
                                    maxLength={160}
                                />
                                {renderFieldError('bio')}
                            </div>

                            <button type="submit" className={styles.saveBtn} disabled={isProfileLoading}>
                                {isProfileLoading ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" /> Saving...
                                    </>
                                ) : (
                                    'Save'
                                )}
                            </button>
                        </form>
                    </section>

                    <section className={styles.settingsSection}>
                        <h2 className={styles.sectionTitle}>
                            <Lock size={22} /> Password
                        </h2>
                        <form className={styles.form} onSubmit={handleChangePassword} noValidate>
                            <div className={styles.inputGroup}>
                                <label htmlFor="current-password">Current Password</label>
                                <input
                                    id="current-password"
                                    type="password"
                                    value={passwords.current_password}
                                    onChange={(e) =>
                                        setPasswords({
                                            ...passwords,
                                            current_password: e.target.value,
                                        })
                                    }
                                    className={fieldErrors.current_password ? 'input-error' : ''}
                                />
                                {renderFieldError('current_password')}
                            </div>
                            <div className={styles.inputGroup}>
                                <label htmlFor="new-password">New Password</label>
                                <input
                                    id="new-password"
                                    type="password"
                                    value={passwords.password}
                                    onChange={(e) => setPasswords({ ...passwords, password: e.target.value })}
                                    className={fieldErrors.password ? 'input-error' : ''}
                                />
                                {renderFieldError('password')}
                            </div>
                            <div className={styles.inputGroup}>
                                <label htmlFor="confirm-password">Confirm Password</label>
                                <input
                                    id="confirm-password"
                                    type="password"
                                    value={passwords.password_confirmation}
                                    onChange={(e) =>
                                        setPasswords({
                                            ...passwords,
                                            password_confirmation: e.target.value,
                                        })
                                    }
                                    className={fieldErrors.password_confirmation ? 'input-error' : ''}
                                />
                                {renderFieldError('password_confirmation')}
                            </div>
                            <button type="submit" className={styles.saveBtn} disabled={isPasswordLoading}>
                                {isPasswordLoading ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" /> Updating...
                                    </>
                                ) : (
                                    'Update'
                                )}
                            </button>
                        </form>
                    </section>
                </div>

                <div className={styles.standaloneList}>
                    <div className={styles.listHeader}>Blocked Users</div>
                    <div className={styles.listContainer}>
                        {blockedLoading ? (
                            <div className={styles.loadingWrapper}>
                                <Loader2 className={`animate-spin ${styles.dimmed}`} size={32} />
                            </div>
                        ) : blocked.length === 0 ? (
                            <div className={`empty-state-placeholder ${styles.emptyPadded}`}>No blocked users.</div>
                        ) : (
                            blocked.map((u) => (
                                <div key={u.id} className={styles.listRow}>
                                    <div className={`${styles.listUser} ${styles.clickable}`} onClick={() => showProfile(u)}>
                                        <Avatar user={u} size={36} />
                                        <span>{u.name}</span>
                                    </div>
                                    <button
                                        onClick={() => handleUnblock(u.id)}
                                        className={styles.badgeButton}
                                        title="Unblock User"
                                        disabled={unblockingId === u.id}
                                    >
                                        <UserMinus size={14} /> {unblockingId === u.id ? 'Unblocking...' : 'Unblock'}
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
