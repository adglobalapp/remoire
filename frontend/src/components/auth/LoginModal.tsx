import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, LogIn } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './AuthModal.module.css';
import { type LoginModalProps } from '../../types';

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onSwitchToRegister }) => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});
        try {
            await login({ email, password });
            onClose();
        } catch (error: any) {
            if (error.errors) {
                setErrors(error.errors);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return createPortal(
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2><LogIn size={20} /> Welcome Back</h2>
                    <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className={styles.authForm}>
                    <div className={styles.formGroup}>
                        <label>Email Address</label>
                        <input
                            type="text"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            className={errors.email ? styles.inputError : ''}
                        />
                        {errors.email && <span className={styles.errorMessage}>{errors.email[0]}</span>}
                    </div>
                    <div className={styles.formGroup}>
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className={errors.password ? styles.inputError : ''}
                        />
                        {errors.password && <span className={styles.errorMessage}>{errors.password[0]}</span>}
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                        {isSubmitting ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className={styles.modalFooter}>
                    <p>Don't have an account? <button onClick={onSwitchToRegister}>Register</button></p>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default LoginModal;
