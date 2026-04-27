import React, { useState, useEffect } from 'react';
import { User, Loader2 } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { updateProfile } from '../../../api/profile';
import { type ApiError } from '../../../types';
import toast from 'react-hot-toast';
import styles from './Forms.module.css';
import FieldError from '../../../components/common/FieldError';

const Details = () => {
    const { user, setUser } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [isLoading, setIsLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setBio(user.bio || '');
        }
    }, [user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
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
            setIsLoading(false);
        }
    };

    return (
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
                    <FieldError errors={fieldErrors.name} />
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
                    <FieldError errors={fieldErrors.bio} />
                </div>

                <button type="submit" className={styles.saveBtn} disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 size={16} className="animate-spin" /> Saving...
                        </>
                    ) : (
                        'Save'
                    )}
                </button>
            </form>
        </section>
    );
};

export default Details;
