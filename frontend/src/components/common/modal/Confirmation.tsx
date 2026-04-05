import { X, AlertTriangle } from 'lucide-react';
import { createPortal } from 'react-dom';
import styles from './Confirmation.module.css';
import { type ConfirmationProps } from '../../../types';

const Confirmation: React.FC<ConfirmationProps> = ({
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    variant = 'default'
}) => {
    const isDanger = variant === 'danger';
    const confirmBtnClass = isDanger ? 'btn-danger' : 'btn-primary';

    return createPortal(
        <div className="global-modal-overlay" onClick={onCancel}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <div className={styles.headerTitleContainer}>
                        {isDanger && <AlertTriangle className={styles.alertIcon} size={24} />}
                        <h3>{title}</h3>
                    </div>
                    <button className="global-modal-close-btn" onClick={onCancel}>
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.modalBody}>
                    <p className={styles.modalMessage}>
                        {message}
                    </p>
                </div>

                <div className={styles.modalFooter}>
                    <button className="btn btn-secondary" onClick={onCancel}>
                        {cancelText}
                    </button>
                    <button className={`btn ${confirmBtnClass}`} onClick={onConfirm}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default Confirmation;
