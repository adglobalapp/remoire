import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './index.module.css';
import Avatar from '../../components/common/Avatar';
import { User, Lock, Camera, Copy, Check, UserMinus, AlertCircle, Loader2 } from 'lucide-react';
import { updateProfile, updatePassword, getBlockedUsers, unblockUser } from '../../api/profile';
import { uploadImage } from '../../api/entries';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user, setUser } = useAuth();
    const [blocked, setBlocked] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [blockedLoading, setBlockedLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    
    const [name, setName] = useState(user?.name || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [passwords, setPasswords] = useState({
        current_password: '',
        password: '',
        password_confirmation: ''
    });

    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchBlocked();
    }, []);

    const fetchBlocked = async () => {
        setBlockedLoading(true);
        try {
            const data = await getBlockedUsers();
            setBlocked(data);
        } catch (err) {
            console.error(err);
        } finally {
            setBlockedLoading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setFieldErrors({});
        try {
            const res = await updateProfile({ name, bio });
            setUser(res.user);
            toast.success('Profile updated');
        } catch (err: any) {
            if (err.status === 422 && err.errors) {
                setFieldErrors(err.errors);
            } else {
                toast.error(err.message || 'Update failed');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setFieldErrors({});
        try {
            await updatePassword(passwords);
            setPasswords({ current_password: '', password: '', password_confirmation: '' });
            toast.success('Password changed');
        } catch (err: any) {
            if (err.status === 422 && err.errors) {
                setFieldErrors(err.errors);
            } else {
                toast.error(err.message || 'Security update failed');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        try {
            const uploadRes = await uploadImage(file);
            if (uploadRes.error) throw new Error(uploadRes.error);
            const newUrl = uploadRes.url;
            
            if (newUrl) {
                const profileRes = await updateProfile({ name, bio, avatar_url: newUrl });
                setUser(profileRes.user);
                toast.success('Avatar updated');
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to upload image');
        } finally {
            setLoading(false);
        }
    };

    const handleUnblock = async (id: number) => {
        try {
            await unblockUser(id);
            setBlocked(prev => prev.filter(u => u.id !== id));
            toast.success('User unblocked');
        } catch (err) {
            toast.error('Failed to unblock user');
        }
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
                        <div className={styles.avatarCircle} onClick={() => fileInputRef.current?.click()}>
                            <Avatar user={user} size={140} className={styles.avatarLarge} />
                        </div>
                        <div className={styles.editAvatarOverlay} onClick={() => fileInputRef.current?.click()}>
                            <Camera size={16} />
                        </div>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            style={{ display: 'none' }} 
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                                <label>What should we call you?</label>
                                <input 
                                    type="text" 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)} 
                                    className={fieldErrors.name ? 'input-error' : ''}
                                    placeholder="Your displayed name"
                                />
                                {renderFieldError('name')}
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Bio</label>
                                <textarea 
                                    value={bio} 
                                    onChange={(e) => setBio(e.target.value)} 
                                    className={fieldErrors.bio ? 'input-error' : ''}
                                    placeholder="Bio, status, or notes..."
                                    rows={3}
                                />
                                {renderFieldError('bio')}
                            </div>
                            
                            <button type="submit" className={styles.saveBtn} disabled={loading}>
                                Save
                            </button>
                        </form>
                    </section>

                    <section className={styles.settingsSection}>
                        <h2 className={styles.sectionTitle}>
                            <Lock size={22} /> Password
                        </h2>
                        <form className={styles.form} onSubmit={handleChangePassword} noValidate>
                            <div className={styles.inputGroup}>
                                <label>Current Password</label>
                                <input 
                                    type="password" 
                                    value={passwords.current_password}
                                    onChange={(e) => setPasswords({...passwords, current_password: e.target.value})}
                                    className={fieldErrors.current_password ? 'input-error' : ''}
                                />
                                {renderFieldError('current_password')}
                            </div>
                            <div className={styles.inputGroup}>
                                <label>New Password</label>
                                <input 
                                    type="password" 
                                    value={passwords.password}
                                    onChange={(e) => setPasswords({...passwords, password: e.target.value})}
                                    className={fieldErrors.password ? 'input-error' : ''}
                                />
                                {renderFieldError('password')}
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Confirm Password</label>
                                <input 
                                    type="password" 
                                    value={passwords.password_confirmation}
                                    onChange={(e) => setPasswords({...passwords, password_confirmation: e.target.value})}
                                    className={fieldErrors.password_confirmation ? 'input-error' : ''}
                                />
                                {renderFieldError('password_confirmation')}
                            </div>
                            <button type="submit" className={styles.saveBtn} disabled={loading}>
                                Update
                            </button>
                        </form>
                    </section>
                </div>
                
                <div className={styles.standaloneList}>
                    <div className={styles.listHeader}>
                        Blocked Users
                    </div>
                    <div className={styles.listContainer}>
                        {blockedLoading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                                <Loader2 className="animate-spin" size={32} opacity={0.3} />
                            </div>
                        ) : blocked.length === 0 ? (
                            <p style={{ padding: '24px', opacity: 0.4, fontStyle: 'italic', fontSize: '1.3rem', fontFamily: 'var(--font-ui)', fontWeight: 400 }}>
                                Your peace of mind is intact. No blocked users.
                            </p>
                        ) : (
                            blocked.map(u => (
                                <div key={u.id} className={styles.listRow}>
                                    <div className={styles.listUser}>
                                        <Avatar user={u} size={36} />
                                        <span>{u.name}</span>
                                    </div>
                                    <button 
                                        onClick={() => handleUnblock(u.id)}
                                        className={styles.badgeButton}
                                        title="Unblock User"
                                    >
                                        <UserMinus size={14} /> Unblock
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
