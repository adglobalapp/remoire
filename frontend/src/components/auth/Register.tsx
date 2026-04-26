import React, { useState } from 'react';
import { X, UserPlus, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Auth.module.css';
import { type RegisterProps, type ApiError } from '../../types';

const Register: React.FC<RegisterProps> = ({ onClose, onSwitchToLogin }) => {
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setFieldErrors({});
        setIsLoading(true);

        try {
            const data = await register(formData);
            if (data) {
                onClose();
            }
        } catch (err: unknown) {
            const error = err as ApiError;
            if (error.errors) {
                setFieldErrors(error.errors);
            } else {
                setFieldErrors({ password_confirmation: [error.message || 'Registration failed.'] });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const renderFieldError = (fieldName: string) => {
        const errors = fieldErrors[fieldName];
        if (!errors || errors.length === 0) return null;
        const messages = errors.filter((msg) => msg && msg.trim());
        if (messages.length === 0) return null;
        return (
            <div className="field-errors-container">
                {messages.map((msg, idx) => (
                    <span key={idx} className="field-error-text">
                        <AlertCircle size={16} /> {msg}
                    </span>
                ))}
            </div>
        );
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
                    <X size={20} />
                </button>

                <div className={styles.modalHeader}>
                    <h2>Start Your Archive</h2>
                    <p className={styles.subtitle}>Create an account to begin capturing your life's journey.</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.authForm} noValidate>
                    <div className={styles.formGroup}>
                        <label htmlFor="reg-name">Full Name</label>
                        <input
                            id="reg-name"
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={fieldErrors.name ? 'input-error' : ''}
                            placeholder="Enter your name"
                        />
                        {renderFieldError('name')}
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="reg-email">Email</label>
                        <input
                            id="reg-email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className={fieldErrors.email ? 'input-error' : ''}
                            placeholder="Enter your email"
                        />
                        {renderFieldError('email')}
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="reg-password">Password</label>
                        <input
                            id="reg-password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className={fieldErrors.password ? 'input-error' : ''}
                            placeholder="••••••••"
                        />
                        {renderFieldError('password')}
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="reg-confirm">Confirm Password</label>
                        <input
                            id="reg-confirm"
                            type="password"
                            value={formData.password_confirmation}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    password_confirmation: e.target.value,
                                })
                            }
                            className={fieldErrors.password_confirmation ? 'input-error' : ''}
                            placeholder="••••••••"
                        />
                        {renderFieldError('password_confirmation')}
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                        {isLoading ? (
                            <Loader2 className="animate-spin" size={24} />
                        ) : (
                            <>
                                <UserPlus size={20} />
                                <span>Create Account</span>
                            </>
                        )}
                    </button>
                </form>

                <div className={styles.modalFooter}>
                    <p className={styles.footerText}>
                        Already have an account?
                        <button onClick={onSwitchToLogin} className={styles.switchBtn}>
                            Sign In
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
