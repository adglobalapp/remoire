import React, { useState } from 'react';
import { X, UserPlus, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Auth.module.css';
import { type RegisterProps } from '../../types';

const Register: React.FC<RegisterProps> = ({ onClose, onSwitchToLogin }) => {
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (formData.password !== formData.password_confirmation) {
            setError('Passwords do not match.');
            return;
        }

        setIsLoading(true);
        try {
            const data = await register(formData);
            if (data) {
                onClose();
            } else {
                setError('Registration failed. Email may be already taken.');
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
                    <h2>Start Your Archive</h2>
                    <p className={styles.subtitle}>Create an account to begin capturing your life's journey.</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.authForm}>
                    <div className={styles.formGroup}>
                        <label htmlFor="reg-name">Full Name</label>
                        <input
                            id="reg-name"
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Enter your name"
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="reg-email">Email</label>
                        <input
                            id="reg-email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="reg-password">Password</label>
                        <input
                            id="reg-password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="reg-confirm">Confirm Password</label>
                        <input
                            id="reg-confirm"
                            type="password"
                            value={formData.password_confirmation}
                            onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
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
