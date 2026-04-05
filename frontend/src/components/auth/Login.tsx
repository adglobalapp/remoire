import React, { useState } from 'react';
import { X, LogIn, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Auth.module.css';
import { type LoginProps } from '../../types';

const Login: React.FC<LoginProps> = ({ onClose, onSwitchToRegister }) => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const data = await login(formData);
            if (data) {
                onClose();
            } else {
                setError('Invalid email or password.');
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
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

                <form onSubmit={handleSubmit} className={styles.authForm}>
                    <div className={styles.formGroup}>
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && (
                        <div className={styles.errorMessage}>
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                        {isLoading ? (
                            <Loader2 className="loading-icon animate-spin" size={24} />
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
