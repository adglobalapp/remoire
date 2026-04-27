import ReactDOM from 'react-dom';
import React, { useState } from 'react';
import { X, LogIn, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Auth.module.css';
import { type LoginProps, type ApiError } from '../../types';
import FieldError from '../common/FieldError';

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

    return ReactDOM.createPortal(
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
                        <FieldError errors={fieldErrors.email} />
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
                        <FieldError errors={fieldErrors.password} />
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
        </div>,
        document.getElementById('modal-root')!,
    );
};

export default Login;
