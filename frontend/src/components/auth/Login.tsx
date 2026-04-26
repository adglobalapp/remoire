import React, { useState } from 'react';
import { X, LogIn, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Auth.module.css';
import { type LoginProps, type ApiError } from '../../types';

const Login: React.FC<LoginProps> = ({ onClose, onSwitchToRegister }) => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setFieldErrors({});
        try {
            const data = await login(formData);
            if (data) {
                onClose();
            }
        } catch (err: unknown) {
            const error = err as ApiError;
            if (error.errors) {
                setFieldErrors(error.errors);
            } else {
                setFieldErrors({ password: [error.message || 'An unexpected error occurred.'] });
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
                    <h2>Welcome Back</h2>
                    <p className={styles.subtitle}>Sign in to continue your journey.</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.authForm} noValidate>
                    <div className={styles.formGroup}>
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className={fieldErrors.email ? 'input-error' : ''}
                            placeholder="Enter your email"
                        />
                        {renderFieldError('email')}
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className={fieldErrors.password ? 'input-error' : ''}
                            placeholder="••••••••"
                        />
                        {renderFieldError('password')}
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                        {isLoading ? (
                            <Loader2 className="animate-spin" size={24} />
                        ) : (
                            <>
                                <LogIn size={20} />
                                <span>Sign In</span>
                            </>
                        )}
                    </button>
                </form>

                <div className={styles.modalFooter}>
                    <p className={styles.footerText}>
                        New to Remoire?
                        <button onClick={onSwitchToRegister} className={styles.switchBtn}>
                            Create an account
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
