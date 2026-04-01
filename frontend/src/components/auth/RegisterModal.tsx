import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, UserPlus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './AuthModal.module.css';

interface RegisterModalProps {
    onClose: () => void;
    onSwitchToLogin: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ onClose, onSwitchToLogin }) => {
    const { register } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});
        try {
            await register({ name, email, password, password_confirmation: confirmPassword });
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
                    <h2><UserPlus size={20} /> Create Account</h2>
                    <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className={styles.authForm}>
                    <div className={styles.formGroup}>
                        <label>Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="John Doe"
                            className={errors.name ? styles.inputError : ''}
                        />
                        {errors.name && <span className={styles.errorMessage}>{errors.name[0]}</span>}
                    </div>
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
                            placeholder="min. 8 characters"
                            className={errors.password ? styles.inputError : ''}
                        />
                        {errors.password && <span className={styles.errorMessage}>{errors.password[0]}</span>}
                    </div>
                    <div className={styles.formGroup}>
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className={errors.password_confirmation ? styles.inputError : ''}
                        />
                        {errors.password_confirmation && <span className={styles.errorMessage}>{errors.password_confirmation[0]}</span>}
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                        {isSubmitting ? 'Creating account...' : 'Register'}
                    </button>
                </form>

                <div className={styles.modalFooter}>
                    <p>Already have an account? <button onClick={onSwitchToLogin}>Login</button></p>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default RegisterModal;
