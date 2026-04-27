import React, { useState } from 'react';
import { Lock, Loader2 } from 'lucide-react';
import { updatePassword } from '../../../api/profile';
import { type ApiError } from '../../../types';
import toast from 'react-hot-toast';
import styles from './Forms.module.css';
import FieldError from '../../../components/common/FieldError';

const Password = () => {
    const [passwords, setPasswords] = useState({
        current_password: '',
        password: '',
        password_confirmation: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
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
            setIsLoading(false);
        }
    };

    return (
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
                    <FieldError errors={fieldErrors.current_password} />
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
                    <FieldError errors={fieldErrors.password} />
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
                    <FieldError errors={fieldErrors.password_confirmation} />
                </div>
                <button type="submit" className={styles.saveBtn} disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 size={16} className="animate-spin" /> Updating...
                        </>
                    ) : (
                        'Update'
                    )}
                </button>
            </form>
        </section>
    );
};

export default Password;
