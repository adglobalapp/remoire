import React from 'react';
import { Check, X } from 'lucide-react';
import styles from './Confirmation.module.css';
import { type ConfirmationProps } from '../../../types';

const Confirmation: React.FC<ConfirmationProps> = ({
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel
}) => {
    return (
        <div className={styles.modalOverlay} onClick={onCancel}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <div className={styles.headerTitleContainer}>
                        <h3>{title}</h3>
                    </div>
                    <button className="global-modal-close-btn" onClick={onCancel}>
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.modalBody}>
                    <p className={styles.modalMessage}>{message}</p>
                </div>

                <div className={styles.modalFooter}>
                    <button className="btn btn-light" onClick={onCancel}>
                        <X size={18} /> {cancelText}
                    </button>
                    <button className="btn btn-dark" onClick={onConfirm}>
                        <Check size={18} /> {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Confirmation;
